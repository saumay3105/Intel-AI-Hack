from rest_framework import serializers
from .models import YoutubeSummary

class YoutubeSummarizerSerializer(serializers.ModelSerializer):
    target_language = serializers.CharField(required=False, default='en')
    summary_length = serializers.CharField(required=False, default='medium')
    
    class Meta:
        model = YoutubeSummary
        fields = ['youtube_url', 'summary', 'target_language', 'summary_length']