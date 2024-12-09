from django.http import HttpRequest
from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.response import Response
from rest_framework import status
import json
import os
import logging
from .functionalities.quiz_generation import generate_quiz_questions
from .functionalities.assessment import analyze_quiz_performance

ACCEPTED_FORMATS = [".pdf", ".doc", ".docx", ".pptx", ".jpg", ".jpeg", ".png"]

@api_view(["POST"])
@parser_classes([MultiPartParser, FormParser, JSONParser])
def generate_quiz(request: HttpRequest):
    """
    Generate quiz questions from either uploaded files or direct text input.
    """
    try:
        # Get input parameters
        file = request.FILES.get("file")
        text = request.data.get("text")

        # Validate inputs
        if not (file or text):
            return Response(
                {
                    "status": "error",
                    "message": "Please provide either a file or text content"
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # Handle file upload case
        if file:
            # Validate file format
            file_extension = os.path.splitext(file.name)[1].lower()
            if file_extension not in ACCEPTED_FORMATS:
                return Response(
                    {
                        "status": "error",
                        "message": f"Invalid file format. Accepted formats are: {', '.join(ACCEPTED_FORMATS)}"
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Save file temporarily
            import tempfile
            with tempfile.NamedTemporaryFile(delete=False, suffix=file_extension) as temp_file:
                for chunk in file.chunks():
                    temp_file.write(chunk)
                temp_file_path = temp_file.name

            try:
                # Generate questions from file
                quiz_json = generate_quiz_questions(file_path=temp_file_path)
                
                # Clean up temp file
                os.unlink(temp_file_path)
                
                # Parse the response
                quiz_data = json.loads(quiz_json)
                questions = quiz_data["questions"]
                
                return Response({
                    "status": "success",
                    "message": "Quiz generated successfully from file",
                    "data": {
                        "topic": quiz_data["topic"],
                        "questions": questions,
                        "total_questions": len(questions),
                        "types": {
                            "mcq": len([q for q in questions if q["type"] == "mcq"]),
                            "true_false": len([q for q in questions if q["type"] == "true-false"]),
                            "fill_in_blank": len([q for q in questions if q["type"] == "fill-in-the-blank"])
                        }
                    }
                }, status=status.HTTP_200_OK)

            except Exception as e:
                # Clean up temp file in case of error
                if os.path.exists(temp_file_path):
                    os.unlink(temp_file_path)
                raise e

        # Handle text input case
        else:
            quiz_json = generate_quiz_questions(text=text)
            quiz_data = json.loads(quiz_json)
            questions = quiz_data["questions"]
            
            return Response({
                "status": "success",
                "message": "Quiz generated successfully from text",
                "data": {
                    "topic": quiz_data["topic"],
                    "questions": questions,
                    "total_questions": len(questions),
                    "types": {
                        "mcq": len([q for q in questions if q["type"] == "mcq"]),
                        "true_false": len([q for q in questions if q["type"] == "true-false"]),
                        "fill_in_blank": len([q for q in questions if q["type"] == "fill-in-the-blank"])
                    }
                }
            }, status=status.HTTP_200_OK)

    except Exception as e:
        logging.error(f"Error generating quiz: {str(e)}")
        return Response({
            "status": "error",
            "message": "An error occurred while generating the quiz",
            "error": str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
@api_view(["POST"])
def analyze_quiz_results(request: HttpRequest):
    """
    Analyze quiz results and provide performance assessment.
    """
    try:
        # Validate required fields
        required_fields = ['topic', 'questions', 'user_answers', 'question_times']
        for field in required_fields:
            if field not in request.data:
                return Response({
                    "status": "error",
                    "message": f"Missing required field: {field}"
                }, status=status.HTTP_400_BAD_REQUEST)

        # Extract data from request
        topic = request.data['topic']
        questions = request.data['questions']
        user_answers = request.data['user_answers']
        question_times = request.data['question_times']

        # Validate data lengths match
        if not (len(questions) == len(user_answers) == len(question_times)):
            return Response({
                "status": "error",
                "message": "Mismatch in data lengths for questions, answers, and times"
            }, status=status.HTTP_400_BAD_REQUEST)

        # Generate assessment
        assessment_result = analyze_quiz_performance(
            topic=topic,
            questions=questions,
            user_answers=user_answers,
            question_times=question_times
        )

        return Response(assessment_result, status=status.HTTP_200_OK)

    except Exception as e:
        logging.error(f"Error analyzing quiz results: {str(e)}")
        return Response({
            "status": "error",
            "message": "An error occurred while analyzing quiz results",
            "error": str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)