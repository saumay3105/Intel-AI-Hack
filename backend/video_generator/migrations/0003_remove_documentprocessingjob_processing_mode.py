# Generated by Django 5.0.1 on 2024-11-02 02:40

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("video_generator", "0002_remove_documentprocessingjob_video_length_and_more"),
    ]

    operations = [
        migrations.RemoveField(
            model_name="documentprocessingjob",
            name="processing_mode",
        ),
    ]