from django.urls import path
from .views import TimerStateView

urlpatterns = [
    path('timer-state/', TimerStateView.as_view(), name='timer-state'),
]