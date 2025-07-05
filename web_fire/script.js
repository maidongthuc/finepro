class PhotoCapture {
    constructor() {
        this.video = document.getElementById('video');
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.fileInput = document.getElementById('fileInput');
        this.photoGallery = document.getElementById('photoGallery');
        this.modal = document.getElementById('photoModal');
        this.modalImage = document.getElementById('modalImage');
        this.stream = null;
        this.photos = [];
        this.currentPhotoIndex = -1;

        this.initializeEventListeners();
        this.updateGalleryDisplay();
    }

    initializeEventListeners() {
        // Camera controls
        document.getElementById('startCamera').addEventListener('click', () => this.startCamera());
        document.getElementById('capturePhoto').addEventListener('click', () => this.capturePhoto());
        document.getElementById('stopCamera').addEventListener('click', () => this.stopCamera());

        // File input
        this.fileInput.addEventListener('change', (e) => this.handleFileSelect(e));

        // Drag and drop
        const uploadLabel = document.querySelector('.upload-label');
        uploadLabel.addEventListener('dragover', (e) => this.handleDragOver(e));
        uploadLabel.addEventListener('drop', (e) => this.handleDrop(e));

        // Gallery controls
        document.getElementById('clearGallery').addEventListener('click', () => this.clearGallery());
        document.getElementById('downloadAll').addEventListener('click', () => this.downloadAll());

        // Modal controls
        document.querySelector('.close').addEventListener('click', () => this.closeModal());
        document.getElementById('downloadSingle').addEventListener('click', () => this.downloadSingle());
        document.getElementById('deleteSingle').addEventListener('click', () => this.deleteSingle());

        // Close modal when clicking outside
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.closeModal();
            }
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
    }

    async startCamera() {
        try {
            const constraints = {
                video: {
                    facingMode: 'user', // Use front camera by default
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                }
            };

            this.stream = await navigator.mediaDevices.getUserMedia(constraints);
            this.video.srcObject = this.stream;
            
            document.getElementById('startCamera').disabled = true;
            document.getElementById('capturePhoto').disabled = false;
            document.getElementById('stopCamera').disabled = false;

            this.showNotification('Camera started successfully!', 'success');
        } catch (error) {
            console.error('Error accessing camera:', error);
            this.showNotification('Error accessing camera. Please check permissions.', 'error');
        }
    }

    stopCamera() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.video.srcObject = null;
            this.stream = null;
        }

        document.getElementById('startCamera').disabled = false;
        document.getElementById('capturePhoto').disabled = true;
        document.getElementById('stopCamera').disabled = true;

        this.showNotification('Camera stopped', 'info');
    }

    capturePhoto() {
        if (!this.stream) {
            this.showNotification('Please start the camera first', 'error');
            return;
        }

        // Set canvas dimensions to match video
        this.canvas.width = this.video.videoWidth;
        this.canvas.height = this.video.videoHeight;

        // Draw video frame to canvas
        this.ctx.drawImage(this.video, 0, 0);

        // Convert canvas to blob
        this.canvas.toBlob((blob) => {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const fileName = `photo-${timestamp}.jpg`;
            
            this.addPhotoToGallery(blob, fileName, 'camera');
            this.showNotification('Photo captured successfully!', 'success');
        }, 'image/jpeg', 0.9);
    }

    handleFileSelect(event) {
        const files = Array.from(event.target.files);
        this.processFiles(files);
    }

    handleDragOver(event) {
        event.preventDefault();
        event.stopPropagation();
        event.target.style.borderColor = '#764ba2';
    }

    handleDrop(event) {
        event.preventDefault();
        event.stopPropagation();
        event.target.style.borderColor = '#667eea';

        const files = Array.from(event.dataTransfer.files);
        const imageFiles = files.filter(file => file.type.startsWith('image/'));
        
        if (imageFiles.length === 0) {
            this.showNotification('Please drop image files only', 'error');
            return;
        }

        this.processFiles(imageFiles);
    }

    processFiles(files) {
        files.forEach(file => {
            if (file.type.startsWith('image/')) {
                this.addPhotoToGallery(file, file.name, 'upload');
            }
        });

        if (files.length > 0) {
            this.showNotification(`${files.length} photo(s) added to gallery`, 'success');
        }

        // Clear file input
        this.fileInput.value = '';
    }

    addPhotoToGallery(file, fileName, source) {
        const photoData = {
            file: file,
            fileName: fileName,
            source: source,
            timestamp: new Date(),
            url: URL.createObjectURL(file)
        };

        this.photos.push(photoData);
        this.updateGalleryDisplay();
    }

    updateGalleryDisplay() {
        if (this.photos.length === 0) {
            this.photoGallery.innerHTML = `
                <div class="empty-gallery">
                    <i class="fas fa-images"></i>
                    <p>No photos yet. Take a photo or select files to get started!</p>
                </div>
            `;
            return;
        }

        this.photoGallery.innerHTML = this.photos.map((photo, index) => `
            <div class="photo-item" onclick="photoApp.openModal(${index})">
                <img src="${photo.url}" alt="${photo.fileName}">
                <div class="photo-overlay">
                    <i class="fas fa-eye"></i>
                </div>
            </div>
        `).join('');
    }

    openModal(index) {
        this.currentPhotoIndex = index;
        const photo = this.photos[index];
        this.modalImage.src = photo.url;
        this.modal.style.display = 'block';
    }

    closeModal() {
        this.modal.style.display = 'none';
        this.currentPhotoIndex = -1;
    }

    downloadSingle() {
        if (this.currentPhotoIndex === -1) return;

        const photo = this.photos[this.currentPhotoIndex];
        this.downloadPhoto(photo.file, photo.fileName);
    }

    deleteSingle() {
        if (this.currentPhotoIndex === -1) return;

        // Revoke object URL to free memory
        URL.revokeObjectURL(this.photos[this.currentPhotoIndex].url);
        
        this.photos.splice(this.currentPhotoIndex, 1);
        this.closeModal();
        this.updateGalleryDisplay();
        this.showNotification('Photo deleted', 'info');
    }

    downloadPhoto(file, fileName) {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(file);
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
    }

    downloadAll() {
        if (this.photos.length === 0) {
            this.showNotification('No photos to download', 'error');
            return;
        }

        this.photos.forEach(photo => {
            setTimeout(() => {
                this.downloadPhoto(photo.file, photo.fileName);
            }, 100);
        });

        this.showNotification(`Downloading ${this.photos.length} photo(s)`, 'success');
    }

    clearGallery() {
        if (this.photos.length === 0) {
            this.showNotification('Gallery is already empty', 'info');
            return;
        }

        if (confirm('Are you sure you want to clear all photos? This action cannot be undone.')) {
            // Revoke all object URLs to free memory
            this.photos.forEach(photo => URL.revokeObjectURL(photo.url));
            
            this.photos = [];
            this.closeModal();
            this.updateGalleryDisplay();
            this.showNotification('Gallery cleared', 'info');
        }
    }

    handleKeyDown(event) {
        if (this.modal.style.display === 'block') {
            switch (event.key) {
                case 'Escape':
                    this.closeModal();
                    break;
                case 'ArrowLeft':
                    this.navigatePhoto(-1);
                    break;
                case 'ArrowRight':
                    this.navigatePhoto(1);
                    break;
                case 'Delete':
                    this.deleteSingle();
                    break;
            }
        }

        // Global shortcuts
        if (event.ctrlKey || event.metaKey) {
            switch (event.key) {
                case 's':
                    event.preventDefault();
                    if (this.currentPhotoIndex !== -1) {
                        this.downloadSingle();
                    }
                    break;
            }
        }
    }

    navigatePhoto(direction) {
        const newIndex = this.currentPhotoIndex + direction;
        if (newIndex >= 0 && newIndex < this.photos.length) {
            this.openModal(newIndex);
        }
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${this.getNotificationIcon(type)}"></i>
            <span>${message}</span>
        `;

        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${this.getNotificationColor(type)};
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
            z-index: 10000;
            display: flex;
            align-items: center;
            gap: 10px;
            font-weight: 500;
            animation: slideIn 0.3s ease;
        `;

        document.body.appendChild(notification);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    getNotificationIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            info: 'info-circle',
            warning: 'exclamation-triangle'
        };
        return icons[type] || 'info-circle';
    }

    getNotificationColor(type) {
        const colors = {
            success: '#28a745',
            error: '#dc3545',
            info: '#17a2b8',
            warning: '#ffc107'
        };
        return colors[type] || '#17a2b8';
    }
}

// Add CSS for notifications
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(notificationStyles);

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.photoApp = new PhotoCapture();
});

// Handle page unload to clean up resources
window.addEventListener('beforeunload', () => {
    if (window.photoApp && window.photoApp.stream) {
        window.photoApp.stopCamera();
    }
});
