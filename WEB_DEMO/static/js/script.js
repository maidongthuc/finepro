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
    
    if (uploadedImages.length === 0) {
        showMessage('Vui lòng thêm ít nhất một ảnh!', 'error');
        return;
    }
    
    // Show loading state
    const originalText = callApiBtn.innerHTML;
    callApiBtn.innerHTML = '<span class="loading"></span> Đang xử lý...';
    callApiBtn.disabled = true;
    
    try {
        // Convert first image to base64 (hoặc xử lý multiple images nếu cần)
        const firstImage = uploadedImages[0];
        const encoded_image = await convertImageToBase64(firstImage.file);
        
        // Prepare data for API
        const apiData = {
            inspection_location: location,
            inspection_items_details: itemDetails,
            inspection_methods_standards: methodStandards,
            encoded_image: encoded_image
        };
        
        // Call the inspection API
        const response = await callInspectionAPI(apiData);
        
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

// Convert image file to base64
async function convertImageToBase64(imageFile) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            // Lấy base64 string, bỏ phần "data:image/...;base64,"
            const base64String = e.target.result.split(',')[1];
            resolve(base64String);
        };
        reader.onerror = function(error) {
            reject(error);
        };
        reader.readAsDataURL(imageFile);
    });
}

// Call inspection API
async function callInspectionAPI(data) {
    const response = await fetch('/api/inspection', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    });
    
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
}

// Simulate API call (replace with your actual API call)
async function simulateApiCall(data) {
    // This function is now replaced by callInspectionAPI
    // Keeping for backward compatibility
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const response = {
                status: 'success',
                message: 'Dữ liệu đã được xử lý thành công (simulation)',
                processedData: {
                    location: data.location,
                    summary: `Phân tích kiểm tra tại: ${data.location}`,
                    recommendations: [
                        'Kiểm tra định kỳ theo tiêu chuẩn đã nêu',
                        'Lưu trữ kết quả kiểm tra để theo dõi',
                        'Cập nhật phương pháp kiểm tra nếu cần'
                    ],
                    imageCount: data.images ? data.images.length : 0,
                    timestamp: new Date().toLocaleString('vi-VN')
                }
            };
            resolve(response);
        }, 1000);
    });
}

// Alternative API call function for processing image to base64
async function processImageToBase64(imageFile) {
    const formData = new FormData();
    formData.append('image', imageFile);
    
    const response = await fetch('/api/process-image', {
        method: 'POST',
        body: formData
    });
    
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    return result.encoded_image;
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

// Test function để gọi external API trực tiếp (for debugging)
async function testExternalAPI(data) {
    try {
        const response = await fetch('http://18.234.31.162:8000/predict_image/', {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('External API Error:', error);
        throw error;
    }
}

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
