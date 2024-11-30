from django.db import models
from django.conf import settings

class NoteSection(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='note_sections')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['created_at']
        unique_together = ['user', 'title']  # Prevent duplicate section names per user

    def __str__(self):
        return f"{self.title} - {self.user.email}"

class StickyNote(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='sticky_notes')
    section = models.ForeignKey(NoteSection, on_delete=models.CASCADE, related_name='notes')
    content = models.TextField()
    position_x = models.FloatField()
    position_y = models.FloatField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['created_at']
