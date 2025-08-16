from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.core.files.storage import default_storage
from django.conf import settings
import os
import json

def home(request):
    """Page d'accueil avec formulaire d'upload"""
    return render(request, 'cv_parser/home.html')

@csrf_exempt
@require_http_methods(["POST"])
def upload_cv(request):
    """Traitement de l'upload du CV"""
    if 'cv_file' not in request.FILES:
        return JsonResponse({'error': 'Aucun fichier sélectionné'}, status=400)
    
    file = request.FILES['cv_file']
    
    # Validation du fichier
    allowed_extensions = ['.pdf', '.doc', '.docx']
    file_extension = os.path.splitext(file.name)[1].lower()
    
    if file_extension not in allowed_extensions:
        return JsonResponse({
            'error': 'Format non supporté. Utilisez PDF, DOC ou DOCX.'
        }, status=400)
    
    if file.size > 10 * 1024 * 1024:  # 10MB max
        return JsonResponse({
            'error': 'Fichier trop volumineux (max 10MB)'
        }, status=400)
    
    try:
        # Sauvegarder le fichier
        filename = default_storage.save(f'cvs/{file.name}', file)
        
        # TODO: Ici vous ajouterez la logique de parsing
        # Pour l'instant, on simule le traitement
        
        return JsonResponse({
            'success': True,
            'message': 'CV analysé avec succès !',
            'filename': filename,
            'download_url': '/download/' + filename.split('/')[-1]
        })
        
    except Exception as e:
        return JsonResponse({
            'error': f'Erreur lors du traitement: {str(e)}'
        }, status=500)

def download_competences(request, filename):
    """Téléchargement du dossier de compétences"""
    # TODO: Logique de génération et téléchargement
    return JsonResponse({'message': 'Fonctionnalité en cours de développement'})
