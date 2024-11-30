import google.generativeai as genai
from youtube_transcript_api import YouTubeTranscriptApi, TranscriptsDisabled
import os
from dotenv import load_dotenv
import logging
from typing import Dict, Optional

# Configure logging
logger = logging.getLogger(__name__)

# Define supported languages
SUPPORTED_LANGUAGES: Dict[str, str] = {
    'en': 'English',
    'hi': 'Hindi',
    'bn': 'Bengali',
    'te': 'Telugu',
    'ta': 'Tamil',
    'mr': 'Marathi',
    'gu': 'Gujarati',
    'kn': 'Kannada',
    'ml': 'Malayalam',
    'pa': 'Punjabi',
    'or': 'Odia'
}

# Define summary length configurations
SUMMARY_LENGTHS = {
    'short': {
        'max_sentences': 6,
        'paragraph_count': '2-3',
        'detail_level': 'brief',
        'key_points': '3-4',
        'description': 'Concise overview highlighting only the most important points'
    },
    'medium': {
        'max_sentences': 12,
        'paragraph_count': '4-5',
        'detail_level': 'moderate',
        'key_points': '5-7',
        'description': 'Balanced summary covering main topics with some supporting details'
    },
    'long': {
        'max_sentences': 20,
        'paragraph_count': '6+',
        'detail_level': 'detailed',
        'key_points': '8-10',
        'description': 'Comprehensive summary with extensive details and examples'
    }
}

# Load environment variables
load_dotenv()

# Configure Google AI
genai.configure(api_key=os.environ["GEMINI_API_KEY"])

def get_video_id(youtube_url: str) -> str:
    """
    Extract video ID from YouTube URL.
    
    Args:
        youtube_url (str): The YouTube video URL
        
    Returns:
        str: The video ID
        
    Raises:
        ValueError: If the URL format is invalid
    """
    try:
        if 'v=' in youtube_url:
            return youtube_url.split('v=')[1].split('&')[0]
        elif 'youtu.be/' in youtube_url:
            return youtube_url.split('youtu.be/')[1].split('?')[0]
        else:
            raise ValueError("Invalid YouTube URL format")
    except Exception as e:
        logger.error(f"Error extracting video ID: {str(e)}")
        raise ValueError(f"Failed to extract video ID: {str(e)}")

def get_transcript(video_id: str) -> list:
    """
    Get transcript for a YouTube video.
    
    Args:
        video_id (str): The YouTube video ID
        
    Returns:
        list: List of transcript entries
        
    Raises:
        RuntimeError: If transcript cannot be fetched
    """
    try:
        transcript = YouTubeTranscriptApi.get_transcript(video_id, languages=['en', 'en-US', 'en-GB', 'hi'])
        return transcript
    except TranscriptsDisabled:
        logger.error(f"Subtitles are disabled for video ID: {video_id}")
        raise RuntimeError("Subtitles are disabled for this video.")
    except Exception as e:
        logger.error(f"Error fetching transcript for video ID {video_id}: {str(e)}")
        raise RuntimeError(f"Error fetching transcript: {str(e)}")

def transcript_to_text(transcript: list) -> str:
    """
    Convert transcript entries to plain text.
    
    Args:
        transcript (list): List of transcript entries
        
    Returns:
        str: Concatenated transcript text
    """
    try:
        return " ".join([entry['text'] for entry in transcript])
    except Exception as e:
        logger.error(f"Error converting transcript to text: {str(e)}")
        raise RuntimeError(f"Error processing transcript: {str(e)}")

def get_length_parameters(summary_length: str) -> dict:
    """
    Get parameters for summary generation based on desired length.
    
    Args:
        summary_length (str): Desired length ('short', 'medium', or 'long')
        
    Returns:
        dict: Configuration parameters for the specified length
    """
    return SUMMARY_LENGTHS.get(summary_length, SUMMARY_LENGTHS['medium'])

def summarize_text(text: str, target_language: str = 'en', summary_length: str = 'medium') -> str:
    """
    Generate a summary of the transcript in the target language with specified length.
    
    Args:
        text (str): The text to summarize
        target_language (str): Target language code (default: 'en')
        summary_length (str): Desired summary length (default: 'medium')
        
    Returns:
        str: Generated summary
        
    Raises:
        RuntimeError: If summary generation fails
    """
    try:
        model = genai.GenerativeModel("gemini-1.5-flash")
        length_params = get_length_parameters(summary_length)
        
        prompt = f"""
        Summarize the following YouTube video transcript in {SUPPORTED_LANGUAGES[target_language]} language.
        Create a {length_params['detail_level']} summary with {length_params['paragraph_count']} paragraphs.
        
        Please structure the summary as follows:

        1. Title
        
        1. Overview:
        - Write a {length_params['detail_level']} introduction ({1 if summary_length == 'short' else 2} sentences)
        
        2. Main Content:
        - Include {length_params['key_points']} key points or main topics
        - Provide supporting details appropriate for {length_params['detail_level']} coverage
        - Use bullet points for better readability
        
        3. Key Takeaways:
        - List {3 if summary_length == 'short' else 4 if summary_length == 'medium' else 5} important takeaways
        - Focus on practical insights or main conclusions
        
        4. Conclusion:
        - Write a concise conclusion ({1 if summary_length == 'short' else 2} sentences)
        
        Guidelines:
        - Target approximately {length_params['max_sentences']} sentences total
        - Maintain a {length_params['detail_level']} level of detail
        - Use markdown formatting for better structure:
          * Headers (##)
          * Bullet points (-)
          * Bold (**) for emphasis
        - Ensure the ENTIRE summary is in {SUPPORTED_LANGUAGES[target_language]} language
        - Use clear and concise language

        Makes sure to adhere to the summary length accurately
        
        Transcript:
        {text}
        """
        
        response = model.generate_content(prompt)
        summary = response.text
        
        # Validate summary length
        sentences = len([s for s in summary.split('.') if s.strip()])
        if sentences < length_params['max_sentences'] * 0.7:  # If summary is too short
            logger.warning(f"Summary length ({sentences}) is shorter than expected ({length_params['max_sentences']})")
        
        return summary
        
    except Exception as e:
        logger.error(f"Error generating summary: {str(e)}")
        raise RuntimeError(f"Error generating summary: {str(e)}")

def process_video(video_id: str, target_language: str = 'en', summary_length: str = 'medium') -> str:
    """
    Process a video from ID to summary.
    
    Args:
        video_id (str): YouTube video ID
        target_language (str): Target language code (default: 'en')
        summary_length (str): Desired summary length (default: 'medium')
        
    Returns:
        str: Generated summary
    """
    transcript = get_transcript(video_id)
    text = transcript_to_text(transcript)
    return summarize_text(text, target_language, summary_length)