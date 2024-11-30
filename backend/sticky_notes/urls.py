from django.urls import path
from . import views

urlpatterns = [
    path('note-sections/', views.note_section_list, name='note-section-list'),
    path('note-sections/<int:pk>/', views.note_section_detail, name='note-section-detail'),
    path('sticky-notes/', views.sticky_note_list, name='sticky-note-list'),
    path('sticky-notes/<int:pk>/', views.sticky_note_detail, name='sticky-note-detail'),
]