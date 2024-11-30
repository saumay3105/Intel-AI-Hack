from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.core.exceptions import ValidationError
from django.core.validators import URLValidator
from .serializers import YoutubeSummarizerSerializer
from .youtube_summarizer import (
    get_video_id, 
    get_transcript,
    summarize_text,
    SUPPORTED_LANGUAGES,
    SUMMARY_LENGTHS
)
from typing import Dict, Any
import logging
from urllib.parse import urlparse
import json

# Configure logging
logger = logging.getLogger(__name__)

class YoutubeSummarizerView(APIView):
    """
    API view for summarizing YouTube videos with language and length support.
    Accepts POST requests with a YouTube URL, target language, and summary length.
    Returns a summary in the requested language and length.
    """

    def validate_youtube_url(self, url: str) -> bool:
        """
        Validate if the provided URL is a valid YouTube URL.
        """
        try:
            # First validate if it's a valid URL
            URLValidator()(url)
            
            # Then check if it's a YouTube URL
            parsed_url = urlparse(url)
            if not ('youtube.com' in parsed_url.netloc or 'youtu.be' in parsed_url.netloc):
                return False
            return True
        except ValidationError:
            return False

    def validate_language(self, language: str) -> bool:
        """
        Validate if the provided language code is supported.
        """
        return language in SUPPORTED_LANGUAGES

    def validate_summary_length(self, length: str) -> bool:
        """
        Validate if the provided summary length is supported.
        """
        return length in SUMMARY_LENGTHS

    def handle_error(self, error: Exception, status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR) -> Response:
        """
        Standardized error handling method.
        """
        error_message = str(error)
        logger.error(f"Error processing request: {error_message}", exc_info=True)
        
        error_response = {
            "error": error_message,
            "status": "failed"
        }
        
        return Response(error_response, status=status_code)

    def log_request_details(self, request_data: Dict[str, Any]) -> None:
        """
        Log important request details for debugging.
        """
        try:
            sanitized_data = {
                "youtube_url": request_data.get("youtube_url", ""),
                "target_language": request_data.get("target_language", "en"),
                "summary_length": request_data.get("summary_length", "medium")
            }
            logger.info(f"Processing request with data: {json.dumps(sanitized_data)}")
        except Exception as e:
            logger.error(f"Error logging request details: {str(e)}")

    def post(self, request) -> Response:
        """
        Handle POST requests for video summarization.
        """
        try:
            # Log initial request
            self.log_request_details(request.data)
            
            # Validate request data
            serializer = YoutubeSummarizerSerializer(data=request.data)
            if not serializer.is_valid():
                logger.error(f"Serializer validation errors: {serializer.errors}")
                return Response({
                    "error": "Invalid request data",
                    "details": serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)

            # Extract validated data
            youtube_url = serializer.validated_data['youtube_url']
            target_language = serializer.validated_data.get('target_language', 'en')
            summary_length = serializer.validated_data.get('summary_length', 'medium')

            # Validate YouTube URL
            if not self.validate_youtube_url(youtube_url):
                return Response({
                    "error": "Invalid YouTube URL provided",
                    "status": "failed"
                }, status=status.HTTP_400_BAD_REQUEST)

            # Validate language
            if not self.validate_language(target_language):
                return Response({
                    "error": f"Unsupported language code: {target_language}. Supported languages are: {', '.join(SUPPORTED_LANGUAGES.keys())}",
                    "status": "failed"
                }, status=status.HTTP_400_BAD_REQUEST)

            # Validate summary length
            if not self.validate_summary_length(summary_length):
                return Response({
                    "error": f"Invalid summary length: {summary_length}. Supported lengths are: {', '.join(SUMMARY_LENGTHS.keys())}",
                    "status": "failed"
                }, status=status.HTTP_400_BAD_REQUEST)

            # Process video
            try:
                # Get video ID
                video_id = get_video_id(youtube_url)
                logger.debug(f"Extracted video ID: {video_id}")

                # Get transcript
                logger.debug("Starting transcript fetch")
                transcript = get_transcript(video_id)
                if not transcript:
                    return Response({
                        "error": "Failed to fetch video transcript",
                        "status": "failed"
                    }, status=status.HTTP_400_BAD_REQUEST)
                logger.debug("Successfully fetched transcript")

                # Generate summary in target language with specified length
                summary = summarize_text(
                    " ".join(entry['text'] for entry in transcript),
                    target_language,
                    summary_length
                )
                logger.debug(f"Successfully generated {summary_length} summary in {SUPPORTED_LANGUAGES[target_language]}")

                # Prepare successful response
                response_data = {
                    "youtube_url": youtube_url,
                    "target_language": target_language,
                    "language_name": SUPPORTED_LANGUAGES[target_language],
                    "summary_length": summary_length,
                    "length_details": SUMMARY_LENGTHS[summary_length],
                    "summary": summary,
                    "status": "success"
                }

                # Save to database and return response
                serializer.save(
                    summary=summary,
                    target_language=target_language,
                    summary_length=summary_length
                )
                
                logger.info(f"Successfully processed video {video_id} with {summary_length} summary in {SUPPORTED_LANGUAGES[target_language]}")
                return Response(response_data, status=status.HTTP_200_OK)

            except ValueError as e:
                return self.handle_error(e, status.HTTP_400_BAD_REQUEST)
            except RuntimeError as e:
                return self.handle_error(e, status.HTTP_400_BAD_REQUEST)
            except Exception as e:
                return self.handle_error(e)

        except Exception as e:
            return self.handle_error(e)

    def get(self, request) -> Response:
        """
        Handle GET requests to provide API information.
        """
        api_info = {
            "name": "YouTube Video Summarizer API",
            "version": "2.0",
            "description": "Summarizes YouTube videos using transcripts with language and length options",
            "supported_languages": SUPPORTED_LANGUAGES,
            "summary_lengths": {
                length: params['description']
                for length, params in SUMMARY_LENGTHS.items()
            },
            "endpoints": {
                "POST /api/summarize/": {
                    "description": "Summarize a YouTube video",
                    "parameters": {
                        "youtube_url": "URL of the YouTube video",
                        "target_language": f"Language code for summary (default: en). Supported: {', '.join(SUPPORTED_LANGUAGES.keys())}",
                        "summary_length": f"Desired summary length (default: medium). Options: {', '.join(SUMMARY_LENGTHS.keys())}"
                    }
                }
            }
        }
        return Response(api_info, status=status.HTTP_200_OK)