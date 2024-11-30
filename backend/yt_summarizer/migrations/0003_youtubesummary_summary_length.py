# Generated by Django 5.0.1 on 2024-11-15 07:29

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('yt_summarizer', '0002_youtubesummary_target_language'),
    ]

    operations = [
        migrations.AddField(
            model_name='youtubesummary',
            name='summary_length',
            field=models.CharField(choices=[('short', 'Short'), ('medium', 'Medium'), ('long', 'Long')], default='medium', max_length=10),
        ),
    ]