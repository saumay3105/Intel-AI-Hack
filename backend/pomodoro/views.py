from rest_framework.views import APIView
from rest_framework.response import Response
from .models import TimerState
from .serializers import TimerStateSerializer

class TimerStateView(APIView):
    def get(self, request):
        timer_state = TimerState.objects.first()
        if not timer_state:
            timer_state = TimerState.objects.create()
        serializer = TimerStateSerializer(timer_state)
        return Response(serializer.data)

    def post(self, request):
        timer_state = TimerState.objects.first()
        if not timer_state:
            timer_state = TimerState.objects.create()
        
        serializer = TimerStateSerializer(timer_state, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)