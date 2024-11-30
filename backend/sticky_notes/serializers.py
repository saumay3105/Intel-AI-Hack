from rest_framework import serializers
from .models import NoteSection, StickyNote

class NoteSectionSerializer(serializers.ModelSerializer):
    note_count = serializers.SerializerMethodField()

    class Meta:
        model = NoteSection
        fields = ['id', 'title', 'description', 'created_at', 'updated_at', 'note_count']
        read_only_fields = ['user']

    def get_note_count(self, obj):
        return obj.notes.count()

class StickyNoteSerializer(serializers.ModelSerializer):
    user_email = serializers.CharField(source='user.email', read_only=True)

    class Meta:
        model = StickyNote
        fields = ['id', 'content', 'position_x', 'position_y', 'created_at', 'updated_at', 'user_email', 'section']
        read_only_fields = ['user']