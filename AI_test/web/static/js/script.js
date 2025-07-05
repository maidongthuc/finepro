// DOM elements
const imageUpload = document.getElementById('imageUpload');
const imagePreview = document.getElementById('imagePreview');
const callApiBtn = document.getElementById('callApiBtn');
const resultSection = document.getElementById('resultSection');
const resultContent = document.getElementById('resultContent');
const inspectionForm = document.getElementById('inspectionForm');

// Store uploaded images
let uploadedImages = [];

// Handle image upload
imageUpload.addEventListener('change', function(e) {
    const files = Array.from(e.target.files);
    
    files.forEach(file => {
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            
            reader.onload = function(e) {
                const imageData = {
                    file: file,
                    dataUrl: e.target.result,
                    name: file.name
                };
                
                uploadedImages.push(imageData);
                displayImage(imageData, uploadedImages.length - 1);
            };
            
            reader.readAsDataURL(file);
        }
    });
    
    // Reset file input
    imageUpload.value = '';
});

// Display image in preview
function displayImage(imageData, index) {
    const imageItem = document.createElement('div');
    imageItem.className = 'image-item';
    imageItem.innerHTML = `
        <img src="${imageData.dataUrl}" alt="${imageData.name}" title="${imageData.name}">
        <button class="remove-btn" onclick="removeImage(${index})" title="Xóa ảnh">×</button>
    `;
    
    imagePreview.appendChild(imageItem);
}

// Remove image from preview
function removeImage(index) {
    uploadedImages.splice(index, 1);
    refreshImagePreview();
}

// Refresh image preview
function refreshImagePreview() {
    imagePreview.innerHTML = '';
    uploadedImages.forEach((imageData, index) => {
        displayImage(imageData, index);
    });
}

// Handle API call
callApiBtn.addEventListener('click', async function() {
    // Get form data
    const formData = new FormData(inspectionForm);
    const location = formData.get('location');
    const itemDetails = formData.get('itemDetails');
    const methodStandards = formData.get('methodStandards');
    
    // Validate form
    if (!location || !itemDetails || !methodStandards) {
        showMessage('Vui lòng điền đầy đủ thông tin!', 'error');
        return;
    }
    
    // Show loading state
    const originalText = callApiBtn.innerHTML;
    callApiBtn.innerHTML = '<span class="loading"></span> Đang xử lý...';
    callApiBtn.disabled = true;
    
    try {
        // Prepare data for API
        const apiData = {
            location: location,
            itemDetails: itemDetails,
            methodStandards: methodStandards,
            images: uploadedImages.map(img => ({
                name: img.name,
                dataUrl: img.dataUrl
            }))
        };
        
        // Simulate API call (replace with your actual API endpoint)
        const response = await simulateApiCall(apiData);
        
        // Display results
        displayResults(response);
        showMessage('API được gọi thành công!', 'success');
        
    } catch (error) {
        console.error('API Error:', error);
        showMessage('Có lỗi xảy ra khi gọi API: ' + error.message, 'error');
    } finally {
        // Restore button state
        callApiBtn.innerHTML = originalText;
        callApiBtn.disabled = false;
    }
});

// Simulate API call (replace with your actual API call)
async function simulateApiCall(data) {
    // This is a simulation - replace with your actual API endpoint
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            // Simulate successful response
            const response = {
                status: 'success',
                message: 'Dữ liệu đã được xử lý thành công',
                processedData: {
                    location: data.location,
                    summary: `Phân tích kiểm tra tại: ${data.location}`,
                    recommendations: [
                        'Kiểm tra định kỳ theo tiêu chuẩn đã nêu',
                        'Lưu trữ kết quả kiểm tra để theo dõi',
                        'Cập nhật phương pháp kiểm tra nếu cần'
                    ],
                    imageCount: data.images.length,
                    timestamp: new Date().toLocaleString('vi-VN')
                }
            };
            resolve(response);
        }, 2000); // Simulate 2 second delay
    });
}

// Real API call function (uncomment and modify for your actual API)
/*
async function callRealAPI(data) {
    const response = await fetch('/api/inspection', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    });
    
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
}
*/

// Display API results
function displayResults(response) {
    const formatted = JSON.stringify(response, null, 2);
    resultContent.textContent = formatted;
    resultSection.style.display = 'block';
    
    // Scroll to results
    resultSection.scrollIntoView({ behavior: 'smooth' });
}

// Show message to user
function showMessage(message, type) {
    // Remove existing messages
    const existingMessages = document.querySelectorAll('.success-message, .error-message');
    existingMessages.forEach(msg => msg.remove());
    
    // Create new message
    const messageDiv = document.createElement('div');
    messageDiv.className = type === 'success' ? 'success-message' : 'error-message';
    messageDiv.textContent = message;
    
    // Insert message at the top of the form
    inspectionForm.insertBefore(messageDiv, inspectionForm.firstChild);
    
    // Auto remove message after 5 seconds
    setTimeout(() => {
        messageDiv.remove();
    }, 5000);
}

// Form reset handler
inspectionForm.addEventListener('reset', function() {
    uploadedImages = [];
    imagePreview.innerHTML = '';
    resultSection.style.display = 'none';
    
    // Remove any existing messages
    const existingMessages = document.querySelectorAll('.success-message, .error-message');
    existingMessages.forEach(msg => msg.remove());
});

// Drag and drop functionality for images
imagePreview.addEventListener('dragover', function(e) {
    e.preventDefault();
    imagePreview.style.background = '#f0f0f0';
});

imagePreview.addEventListener('dragleave', function(e) {
    e.preventDefault();
    imagePreview.style.background = '';
});

imagePreview.addEventListener('drop', function(e) {
    e.preventDefault();
    imagePreview.style.background = '';
    
    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length > 0) {
        // Trigger the same upload logic
        imageFiles.forEach(file => {
            const reader = new FileReader();
            reader.onload = function(e) {
                const imageData = {
                    file: file,
                    dataUrl: e.target.result,
                    name: file.name
                };
                uploadedImages.push(imageData);
                displayImage(imageData, uploadedImages.length - 1);
            };
            reader.readAsDataURL(file);
        });
    }
});

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    console.log('Inspection Management System loaded successfully!');
    
    // Add some interactive effects
    const formGroups = document.querySelectorAll('.form-group');
    formGroups.forEach((group, index) => {
        group.style.animationDelay = `${index * 0.1}s`;
    });
});
