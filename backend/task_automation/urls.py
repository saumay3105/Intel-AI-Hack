from django.urls import path
from . import views

urlpatterns = [
    path("generate-tasks/", views.generate_tasks_view, name="generate_tasks"),
    path("generate-roadmap/", views.generate_roadmap_view, name="generate_roadmap"),
]