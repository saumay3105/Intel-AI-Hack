import os
import google.generativeai as genai
import textract
import ast
import json

def extract_text_from_document(doc_path: str):
    text = textract.process(doc_path)
    return text


def generate_quiz_questions(file_path: str = None, text: str = None) -> str:
    GEMINI_API_KEY = os.environ["GEMINI_API_KEY"]
    genai.configure(api_key=GEMINI_API_KEY)
    model = genai.GenerativeModel("gemini-1.5-flash")
    llm_prompt = """You are provided with the following text:
    Based on this text, generate pool of 10 questions that assess based on this text..include a variety of question types:
    - Multiple-choice (MCQ)
    - True/false
    - Fill in the blanks (with options)

    For each question, output the response in the following JSON format:

    {
      "topic": "Concise topic here",
      "questions": [
        {
          "question": "Question 1 text here?",
          "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
          "correctAnswer": "Correct option here",
          "explanation": "Explanation for the answer here",
          "type": "mcq" or "true-false" or "fill-in-the-blank",
          "difficulty": "Easy" or "Medium" or "Hard"
        }
      ]
    }

    Ensure:
    - If the input text is already a topic, use it as is for the topic value of json. If it's a longer text, generate a concise topic for the topic value of json that captures the main subject
    - The text will either have a topic or whole description. If it has a topic then generate questions accroding to the topic and if description then geenrate quiz from that description 
    - The question should have options regardless of type..if true false then two options - true and false...and if its fill in the blanks or mcq, then 4 options...fill in the blanks questions shld have a ______ where the option will go
    - The correct answers are accurate and based on the provided text.
    - Each question is labeled with the appropriate difficulty level: "Easy," "Medium," or "Hard". 
    - In total there must be 10 questions. All type true-false, MCQ's and Fill in the blanks(with 3 options) must be present.
    - Provide a detailed explanations for each correct answer.
    
    Reply with just the JSON response and nothing else.
    """

    if text:
        llm_prompt += f"\n\nContent:\n{text}"
        response = model.generate_content([llm_prompt])
    else:
        file_extension = os.path.splitext(file_path)[-1].lower()

        if file_extension == ".pdf":
            pdf = genai.upload_file(file_path)
            response = model.generate_content([llm_prompt, pdf])
        elif file_extension in [".jpg", ".jpeg", ".png"]:
            sample_image = genai.upload_file(file_path)
            response = model.generate_content([llm_prompt, sample_image])
        elif file_extension in [".doc", ".docx", ".pptx"]:
            document_text = extract_text_from_document(file_path)
            llm_prompt += f"\n\nContent:\n{document_text}"
            response = model.generate_content([llm_prompt])
        else:
            raise ValueError("Unsupported file type.")

    # Clean and parse the response
    response_text = response.text.strip()
    
    # Handle cases where the response might include markdown code blocks
    if "```json" in response_text:
        response_text = response_text.split("```json")[1].split("```")[0].strip()
    elif "```" in response_text:
        response_text = response_text.split("```")[1].strip()

    try:
        # Parse the JSON response
        quiz_data = json.loads(response_text)
        
        # Ensure the response has the required structure
        if not isinstance(quiz_data, dict):
            raise ValueError("Response is not a valid JSON object")
        
        if "topic" not in quiz_data or "questions" not in quiz_data:
            raise ValueError("Response missing required fields (topic or questions)")
        
        if not isinstance(quiz_data["questions"], list):
            raise ValueError("Questions field is not a list")
            
        # Return the properly formatted JSON string
        return json.dumps(quiz_data)
        
    except json.JSONDecodeError as e:
        raise ValueError(f"Failed to parse LLM response as JSON: {str(e)}")
