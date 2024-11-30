from django.http import HttpRequest
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import NoteSection, StickyNote
from .serializers import NoteSectionSerializer, StickyNoteSerializer

@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def note_section_list(request: HttpRequest):
    if request.method == "GET":
        sections = NoteSection.objects.filter(user=request.user)
        serializer = NoteSectionSerializer(sections, many=True)
        return Response(serializer.data)
    
    elif request.method == "POST":
        serializer = NoteSectionSerializer(data=request.data)
        if serializer.is_valid():
            try:
                serializer.save(user=request.user)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            except Exception as e:
                return Response(
                    {"error": "Title must be unique for each user"},
                    status=status.HTTP_400_BAD_REQUEST
                )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(["GET", "PUT", "DELETE"])
@permission_classes([IsAuthenticated])
def note_section_detail(request: HttpRequest, pk):
    try:
        section = NoteSection.objects.get(pk=pk, user=request.user)
    except NoteSection.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == "GET":
        serializer = NoteSectionSerializer(section)
        return Response(serializer.data)

    elif request.method == "PUT":
        serializer = NoteSectionSerializer(section, data=request.data)
        if serializer.is_valid():
            try:
                serializer.save()
                return Response(serializer.data)
            except Exception as e:
                return Response(
                    {"error": "Title must be unique for each user"},
                    status=status.HTTP_400_BAD_REQUEST
                )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == "DELETE":
        section.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def sticky_note_list(request: HttpRequest):
    if request.method == "GET":
        section_id = request.query_params.get('section')
        
        # If no section_id is provided, return a 400 Bad Request
        if not section_id:
            return Response(
                {"error": "Section ID is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Verify that the section exists and belongs to the user
            section = NoteSection.objects.get(
                id=section_id,
                user=request.user
            )
        except NoteSection.DoesNotExist:
            return Response(
                {"error": "Section not found or access denied"},
                status=status.HTTP_404_NOT_FOUND
            )
            
        notes = StickyNote.objects.filter(
            user=request.user,
            section_id=section_id
        )
        serializer = StickyNoteSerializer(notes, many=True)
        return Response(serializer.data)
    
    elif request.method == "POST":
        serializer = StickyNoteSerializer(data=request.data)
        if serializer.is_valid():
            try:
                section = NoteSection.objects.get(
                    id=request.data.get('section'),
                    user=request.user
                )
                serializer.save(user=request.user)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            except NoteSection.DoesNotExist:
                return Response(
                    {"error": "Invalid section or permission denied"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            except Exception as e:
                return Response(
                    {"error": str(e)},
                    status=status.HTTP_400_BAD_REQUEST
                )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
@api_view(["GET", "PUT", "DELETE"])
@permission_classes([IsAuthenticated])
def sticky_note_detail(request: HttpRequest, pk):
    try:
        note = StickyNote.objects.get(pk=pk, user=request.user)
    except StickyNote.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == "GET":
        serializer = StickyNoteSerializer(note)
        return Response(serializer.data)

    elif request.method == "PUT":
        serializer = StickyNoteSerializer(note, data=request.data)
        if serializer.is_valid():
            # Verify that the new section belongs to the user if section is being changed
            if 'section' in request.data:
                try:
                    section = NoteSection.objects.get(
                        id=request.data['section'],
                        user=request.user
                    )
                except NoteSection.DoesNotExist:
                    return Response(
                        {"error": "Invalid section or permission denied"},
                        status=status.HTTP_400_BAD_REQUEST
                    )
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == "DELETE":
        note.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)