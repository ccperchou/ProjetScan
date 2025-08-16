from django import forms

class CVUploadForm(forms.Form):
    cv_file = forms.FileField(
        label='Votre CV',
        widget=forms.FileInput(attrs={
            'accept': '.pdf,.doc,.docx',
            'class': 'form-control',
            'id': 'cv-file-input'
        }),
        help_text='Formats acceptés: PDF, DOC, DOCX (max 10MB)'
    )
    
    def clean_cv_file(self):
        file = self.cleaned_data['cv_file']
        
        # Validation de la taille
        if file.size > 10 * 1024 * 1024:
            raise forms.ValidationError('Le fichier ne peut pas dépasser 10MB')
        
        # Validation de l'extension
        allowed_extensions = ['.pdf', '.doc', '.docx']
        import os
        extension = os.path.splitext(file.name)[1].lower()
        if extension not in allowed_extensions:
            raise forms.ValidationError('Format non supporté')
            
        return file
