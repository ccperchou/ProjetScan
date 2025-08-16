// ============================================================================
// CV Parser Pro - Upload JavaScript
// ============================================================================

document.addEventListener('DOMContentLoaded', function() {
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const progressContainer = document.getElementById('progressContainer');
    const progressBar = document.getElementById('progressBar');
    const progressPercent = document.querySelector('.progress-percent');
    const resultContainer = document.getElementById('resultContainer');
    const uploadLink = document.querySelector('.upload-link');

    // États
    let isUploading = false;

    // ================================
    // Event Listeners
    // ================================

    // Clic sur la zone de drop
    dropZone.addEventListener('click', () => {
        if (!isUploading) {
            fileInput.click();
        }
    });

    // Clic sur le lien
    uploadLink.addEventListener('click', (e) => {
        e.stopPropagation();
        fileInput.click();
    });

    // Sélection de fichier
    fileInput.addEventListener('change', handleFileSelect);

    // Drag & Drop
    dropZone.addEventListener('dragover', handleDragOver);
    dropZone.addEventListener('dragleave', handleDragLeave);
    dropZone.addEventListener('drop', handleDrop);

    // Prévenir les comportements par défaut
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults);
        document.body.addEventListener(eventName, preventDefaults);
    });

    // ================================
    // Fonctions
    // ================================

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    function handleDragOver(e) {
        dropZone.classList.add('drag-over');
    }

    function handleDragLeave(e) {
        dropZone.classList.remove('drag-over');
    }

    function handleDrop(e) {
        dropZone.classList.remove('drag-over');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFile(files[0]);
        }
    }

    function handleFileSelect(e) {
        const file = e.target.files[0];
        if (file) {
            handleFile(file);
        }
    }

    function handleFile(file) {
        // Validation
        if (!validateFile(file)) {
            return;
        }

        // Commencer l'upload
        startUpload(file);
    }

    function validateFile(file) {
        const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        const maxSize = 10 * 1024 * 1024; // 10MB

        if (!allowedTypes.includes(file.type)) {
            showError('Format de fichier non supporté. Utilisez PDF, DOC ou DOCX.');
            return false;
        }

        if (file.size > maxSize) {
            showError('Le fichier est trop volumineux (maximum 10MB).');
            return false;
        }

        return true;
    }

    function startUpload(file) {
        isUploading = true;
        
        // Masquer la zone de drop et afficher la progression
        dropZone.style.display = 'none';
        progressContainer.style.display = 'block';
        resultContainer.style.display = 'none';

        // Préparer FormData
        const formData = new FormData();
        formData.append('cv_file', file);

        // Upload avec XMLHttpRequest pour suivre la progression
        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener('progress', (e) => {
            if (e.lengthComputable) {
                const percentComplete = (e.loaded / e.total) * 100;
                updateProgress(percentComplete);
            }
        });

        xhr.addEventListener('load', () => {
            if (xhr.status === 200) {
                try {
                    const response = JSON.parse(xhr.responseText);
                    if (response.success) {
                        showSuccess(response);
                    } else {
                        showError(response.error || 'Erreur lors du traitement');
                    }
                } catch (error) {
                    showError('Erreur lors de la lecture de la réponse');
                }
            } else {
                try {
                    const response = JSON.parse(xhr.responseText);
                    showError(response.error || 'Erreur serveur');
                } catch (error) {
                    showError('Erreur de communication avec le serveur');
                }
            }
            isUploading = false;
        });

        xhr.addEventListener('error', () => {
            showError('Erreur de connexion');
            isUploading = false;
        });

        // Obtenir le token CSRF
        const csrfToken = getCsrfToken();
        
        xhr.open('POST', '/upload/');
        xhr.setRequestHeader('X-CSRFToken', csrfToken);
        xhr.send(formData);
    }

    function updateProgress(percent) {
        const roundedPercent = Math.round(percent);
        progressBar.style.width = roundedPercent + '%';
        progressPercent.textContent = roundedPercent + '%';
        
        // Changer le texte selon la progression
        const progressText = document.querySelector('.progress-text');
        if (roundedPercent < 30) {
            progressText.textContent = 'Upload en cours...';
        } else if (roundedPercent < 70) {
            progressText.textContent = 'Analyse du CV...';
        } else if (roundedPercent < 90) {
            progressText.textContent = 'Extraction des compétences...';
        } else {
            progressText.textContent = 'Génération du dossier...';
        }
    }

    function showSuccess(response) {
        progressContainer.style.display = 'none';
        resultContainer.style.display = 'block';
        
        // Ajouter les event listeners pour les boutons de téléchargement
        const downloadPdf = document.getElementById('downloadPdf');
        const downloadWord = document.getElementById('downloadWord');
        
        downloadPdf.addEventListener('click', () => {
            downloadFile(response.download_url, 'pdf');
        });
        
        downloadWord.addEventListener('click', () => {
            downloadFile(response.download_url, 'docx');
        });
    }

    function showError(message) {
        progressContainer.style.display = 'none';
        dropZone.style.display = 'block';
        
        // Créer et afficher le message d'erreur
        const errorDiv = document.createElement('div');
        errorDiv.className = 'alert alert-danger mt-3';
        errorDiv.innerHTML = `
            <i class="fas fa-exclamation-triangle me-2"></i>
            ${message}
        `;
        
        // Supprimer l'ancienne erreur s'il y en a une
        const oldError = document.querySelector('.alert-danger');
        if (oldError) {
            oldError.remove();
        }
        
        // Ajouter la nouvelle erreur
        dropZone.parentNode.insertBefore(errorDiv, dropZone.nextSibling);
        
        // Supprimer l'erreur après 5 secondes
        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    }

    function downloadFile(url, format) {
        // Créer un lien de téléchargement temporaire
        const link = document.createElement('a');
        link.href = url + `?format=${format}`;
        link.download = `dossier_competences.${format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    function getCsrfToken() {
        const cookies = document.cookie.split(';');
        for (let cookie of cookies) {
            const [name, value] = cookie.trim().split('=');
            if (name === 'csrftoken') {
                return value;
            }
        }
        // Fallback: chercher dans les meta tags
        const csrfMeta = document.querySelector('[name=csrfmiddlewaretoken]');
        return csrfMeta ? csrfMeta.value : '';
    }

    // ================================
    // Fonctions utilitaires
    // ================================

    function resetUploadState() {
        isUploading = false;
        dropZone.style.display = 'block';
        progressContainer.style.display = 'none';
        resultContainer.style.display = 'none';
        fileInput.value = '';
    }

    // Ajouter un bouton de reset si nécessaire
    const resetBtn = document.createElement('button');
    resetBtn.className = 'btn btn-sm btn-outline-secondary mt-2';
    resetBtn.innerHTML = '<i class="fas fa-redo me-1"></i>Analyser un autre CV';
    resetBtn.style.display = 'none';
    resetBtn.addEventListener('click', resetUploadState);
    
    resultContainer.appendChild(resetBtn);

    // Afficher le bouton reset quand on a un résultat
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.target.id === 'resultContainer') {
                if (mutation.target.style.display !== 'none') {
                    resetBtn.style.display = 'inline-block';
                } else {
                    resetBtn.style.display = 'none';
                }
            }
        });
    });

    observer.observe(resultContainer, {
        attributes: true,
        attributeFilter: ['style']
    });
});

// ================================
// Fonctions globales
// ================================

// Animation de chargement pour les boutons
function addButtonLoading(button, originalText) {
    button.disabled = true;
    button.innerHTML = `
        <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
        Téléchargement...
    `;
    
    setTimeout(() => {
        button.disabled = false;
        button.innerHTML = originalText;
    }, 2000);
}

// Notification toast (optionnel)
function showToast(message, type = 'success') {
    const toastContainer = document.createElement('div');
    toastContainer.className = 'position-fixed top-0 end-0 p-3';
    toastContainer.style.zIndex = '9999';
    
    const toast = document.createElement('div');
    toast.className = `toast align-items-center text-white bg-${type} border-0`;
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">
                <i class="fas fa-${type === 'success' ? 'check' : 'exclamation-triangle'} me-2"></i>
                ${message}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
        </div>
    `;
    
    toastContainer.appendChild(toast);
    document.body.appendChild(toastContainer);
    
    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();
    
    toast.addEventListener('hidden.bs.toast', () => {
        document.body.removeChild(toastContainer);
    });
}

