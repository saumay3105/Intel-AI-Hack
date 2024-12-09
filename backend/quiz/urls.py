from django.urls import path
from . import views

urlpatterns = [
    path("generate-questions/", views.generate_quiz, name="generate_quiz"),
    path('analyze-quiz/', views.analyze_quiz_results, name='analyze-quiz'),

]
