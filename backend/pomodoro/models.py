from django.db import models

class TimerState(models.Model):
    time_left = models.IntegerField(default=1500)  
    is_running = models.BooleanField(default=False)
    timer_type = models.CharField(max_length=20, default='pomodoro')
    last_updated = models.DateTimeField(auto_now=True)

