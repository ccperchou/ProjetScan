from django.db import models
from django.core.files.storage import default_storage
import os

class CVUpload(models.Model):
    file = models.FileField(upload_to='cvs/')
    uploaded_at = models.DateTimeField(auto_now_add=True)
    original_filename = models.CharField(max_length=255)
    file_type = models.CharField(max_length=10)
    status = models.CharField(max_length=20, default='pending')
    
    def __str__(self):
        return f"CV {self.id} - {self.original_filename}"

class CompetencesFolder(models.Model):
    cv_upload = models.OneToOneField(CVUpload, on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    generated_file = models.FileField(upload_to='dossiers_competences/', null=True, blank=True)
    
    def __str__(self):
        return f"Dossier {self.name}"
