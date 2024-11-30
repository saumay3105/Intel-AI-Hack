from rest_framework import serializers
from .models import TimerState

class TimerStateSerializer(serializers.ModelSerializer):
    class Meta:
        model = TimerState
        fields = ['time_left', 'is_running', 'timer_type']