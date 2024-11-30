from django.db import models

class YoutubeSummary(models.Model):
    SUMMARY_LENGTH_CHOICES = [
        ('short', 'Short'),
        ('medium', 'Medium'),
        ('long', 'Long'),
    ]
    
    youtube_url = models.URLField()
    summary = models.TextField(blank=True)
    target_language = models.CharField(max_length=5, default='en')
    summary_length = models.CharField(
        max_length=10, 
        choices=SUMMARY_LENGTH_CHOICES,
        default='medium'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.youtube_url