import google.generativeai as genai
import json
from typing import List, Dict, Any

def analyze_quiz_performance(
    topic: str,
    questions: List[Dict[str, Any]],
    user_answers: List[Dict[str, Any]],
    question_times: List[int]
) -> Dict[str, Any]:
    """
    Analyze user's quiz performance using Gemini to generate insights and recommendations.
    """
    GEMINI_API_KEY = 'AIzaSyBYKJmcss0_ESlLD0i3veYFmv9YhjXsaQc'
    genai.configure(api_key=GEMINI_API_KEY)
    model = genai.GenerativeModel('gemini-1.5-flash')

    # Calculate basic metrics
    total_questions = len(questions)
    answered_questions = len([a for a in user_answers if a.get('answered', False)])
    correct_answers = sum(1 for q, a in zip(questions, user_answers) 
                         if a.get('selected_answer') == q['correctAnswer'])
    
    # Prepare performance data for each question
    question_performance = []
    for i, (question, answer, time) in enumerate(zip(questions, user_answers, question_times)):
        performance = {
            'question_number': i + 1,
            'question_text': question['question'],
            'question_type': question['type'],
            'difficulty': question['difficulty'],
            'correct_answer': question['correctAnswer'],
            'user_answer': answer.get('selected_answer', 'Not answered'),
            'is_correct': answer.get('selected_answer') == question['correctAnswer'],
            'time_taken': time
        }
        question_performance.append(performance)

    # Prepare prompt for Gemini
    analysis_prompt = f"""
    Analyze this quiz performance data and provide insights in valid JSON format:

    Quiz Topic: {topic}
    Total Questions: {total_questions}
    Questions Attempted: {answered_questions}
    Correct Answers: {correct_answers}

    Performance Details:
    {json.dumps(question_performance, indent=2)}

    Return only a JSON object in this exact format:
    {{
        "overall_performance": {{
            "proficiency_level": "Beginner",
            "strengths": ["strength1", "strength2"],
            "weaknesses": ["weakness1", "weakness2"]
        }},
        "time_management": {{
            "time_management_assessment": "Overall assessment of time management",
            "recommendations": ["tip1", "tip2"]
        }},
        "topic_wise_analysis": [
            {{
                "topic": "Specific topic",
                "mastery_level": "Poor",
                "revision_points": ["point1", "point2"],
                "recommended_resources": ["resource1", "resource2"]
            }}
        ]
    }}

    Important: Provide only the JSON response, no additional text or formatting.
    """

    # Generate analysis using Gemini
    response = model.generate_content(analysis_prompt)
    
    # Clean and parse the response
    try:
        response_text = response.text.strip()
        
        # Remove any markdown code blocks if present
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0].strip()
        elif "```" in response_text:
            response_text = response_text.split("```")[1].strip()
        
        # Parse the cleaned JSON response
        analysis_json = json.loads(response_text)
        
        # Validate required fields
        required_fields = ['overall_performance', 'time_management', 'topic_wise_analysis']
        for field in required_fields:
            if field not in analysis_json:
                raise ValueError(f"Missing required field in response: {field}")
        
        return {
            "status": "success",
            "message": "Assessment generated successfully",
            "data": analysis_json
        }
        
    except json.JSONDecodeError as e:
        return {
            "status": "error",
            "message": "Failed to parse assessment response",
            "error": f"JSON parsing error: {str(e)}. Response: {response_text[:200]}"
        }
    except Exception as e:
        return {
            "status": "error",
            "message": "Failed to generate assessment",
            "error": str(e)
        }