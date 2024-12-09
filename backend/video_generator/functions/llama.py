import os
from typing import List
import textract
from dotenv import load_dotenv, find_dotenv
import ast
from llama_cpp import Llama


class Llama3TextProcessor:
    def __init__(self):
        """
        Initialize the Llama 3 model with optimized configuration.
        Llama 3 offers improved performance and capabilities over Llama 2,
        including better context understanding and more natural responses.
        """
        load_dotenv(find_dotenv())

        # Get model path from environment variable or use default
        # Using Llama 3's 7B model which offers a good balance of performance and resource usage
        model_path = os.getenv("LLAMA_MODEL_PATH", "models/llama-3-7b-chat.Q5_K_M.gguf")

        # Initialize Llama 3 model with appropriate parameters
        # Increased context window and optimized parameters for Llama 3
        self.llm = Llama(
            model_path=model_path,
            n_ctx=4096,  # Increased context window for better understanding
            n_threads=4,  # Number of CPU threads to use
            n_batch=512,  # Batch size for processing
            n_gpu_layers=0,  # Set to higher number if GPU acceleration is available
        )

    def generate_completion(self, prompt: str, max_tokens: int = 1000) -> str:
        """
        Generate completion using Llama 3 model with optimized parameters.
        Llama 3 has improved temperature handling and better response generation.
        """
        # Using Llama 3's chat format for better response structuring
        formatted_prompt = f"<|im_start|>system\nYou are a helpful AI assistant.\n<|im_end|>\n<|im_start|>user\n{prompt}<|im_end|>\n<|im_start|>assistant\n"

        response = self.llm.create_completion(
            prompt=formatted_prompt,
            max_tokens=max_tokens,
            temperature=0.7,  # Balanced creativity and coherence
            top_p=0.95,  # Nucleus sampling parameter
            top_k=50,  # Top-k sampling parameter
            stop=["<|im_end|>"],
            echo=False,
        )
        return response["choices"][0]["text"].strip()


def extract_text_from_document(doc_path: str) -> str:
    """
    Extract text content from various document formats using textract.
    This function remains unchanged as it handles document processing independently.
    """
    text = textract.process(doc_path)
    return text.decode("utf-8")


def generate_script(
    video_preference: str, language: str, file_path: str = None, text: str = None
) -> str:
    """
    Generate a script from input text or file using Llama 3 model.
    Leverages Llama 3's improved natural language understanding and generation capabilities.
    """
    processor = Llama3TextProcessor()

    # Enhanced prompt template optimized for Llama 3's capabilities
    llm_prompt = f"""
    Create an engaging and coherent script from the following content. Follow these steps:
    1. Analyze and extract the key information and main points
    2. Organize the content into logical, sequential subtopics
    3. Develop clear, engaging explanations for each subtopic
    4. Ensure smooth transitions and flow between topics
    5. Use accessible language with relevant examples
    6. Maintain comprehensive coverage of important information
    7. Exclude any QR codes or external links
    
    Additional requirements:
    - Video style: {video_preference}
    - Language: {language}
    
    Content to process:
    {content}
    
    Please generate only the final script without any formatting markers or labels.
    """.format(
        video_preference=video_preference,
        language=language,
        content=text if text else "",
    )

    if not text and file_path:
        file_extension = os.path.splitext(file_path)[-1].lower()

        if file_extension in [".pdf", ".doc", ".docx", ".pptx"]:
            document_text = extract_text_from_document(file_path)
            llm_prompt = llm_prompt.format(content=document_text)
        else:
            raise ValueError(
                f"Unsupported file type: {file_extension}. Please provide a PDF, DOC, DOCX, or PPTX file."
            )

    return processor.generate_completion(llm_prompt)


def generate_keywords(text: str) -> List[str]:
    """
    Generate detailed image generation prompts using Llama 3's enhanced understanding.
    Takes advantage of Llama 3's improved concept visualization capabilities.
    """
    processor = Llama3TextProcessor()

    llm_prompt = f"""
    Analyze the following text and create precise, vivid image generation prompts that:
    - Capture key themes and concepts sequentially
    - Use single phrases of maximum 10 words each
    - Provide clear, detailed visual descriptions
    - Maintain narrative coherence
    - Enable creative artistic interpretation
    
    Return the prompts in a Python list format: ["prompt 1", "prompt 2", "prompt 3"]
    
    Text to analyze:
    {text}
    """.format(
        text=text
    )

    response = processor.generate_completion(llm_prompt)

    try:
        # Extract and parse the list from response
        start_idx = response.find("[")
        end_idx = response.rfind("]") + 1
        trimmed_response = response[start_idx:end_idx]
        return ast.literal_eval(trimmed_response)
    except:
        # Fallback handling with improved error messages
        print("Warning: Could not parse response as list. Returning single-item list.")
        return [response.strip()]


def generate_keywords_fast(text: str) -> List[str]:
    """
    Generate concise keywords for image generation using Llama 3's improved semantic understanding.
    Optimized for quick, efficient keyword extraction.
    """
    processor = Llama3TextProcessor()

    llm_prompt = f"""
    Generate 20 concise, visually-focused keywords from this text:
    - Use 1-3 words per keyword
    - Ensure visual descriptiveness
    - Avoid branded terms
    - Focus on universal concepts
    - Return as a Python list
    
    Source text:
    {text}
    """.format(
        text=text
    )

    response = processor.generate_completion(llm_prompt)

    try:
        start_idx = response.find("[")
        end_idx = response.rfind("]") + 1
        trimmed_response = response[start_idx:end_idx]
        return ast.literal_eval(trimmed_response)
    except:
        # Improved fallback handling with filtering
        keywords = [k.strip() for k in response.split("\n") if k.strip()]
        return keywords[:20] if len(keywords) > 20 else keywords


def generate_answer_from_question(
    question: str = "What are the three states of matter?", speech: str = "formal"
) -> str:
    """
    Generate educational responses using Llama 3's enhanced natural language capabilities.
    Provides more nuanced and contextually appropriate answers.
    """
    processor = Llama3TextProcessor()

    prompt = f"""
    As an expert teacher, provide a clear and engaging answer to the following question.
    Use {speech} speech style and avoid any special formatting.
    
    Question: {question}
    
    Guidelines:
    - Keep the explanation clear and accessible
    - Use relevant examples when helpful
    - Maintain appropriate complexity for a student
    - Focus on accuracy and comprehension
    """

    return processor.generate_completion(prompt)
