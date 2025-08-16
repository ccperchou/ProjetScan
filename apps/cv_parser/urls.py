from django.urls import path
from . import views

app_name = 'cv_parser'

urlpatterns = [
    path('', views.home, name='home'),
    path('upload/', views.upload_cv, name='upload_cv'),
    path('download/<str:filename>/', views.download_competences, name='download'),
]
