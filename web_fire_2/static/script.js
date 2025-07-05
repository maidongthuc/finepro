// Global variables
let currentStream = null;
let capturedImages = {
    fire: null,
    gauge: null
};

// Tab functionality
function showTab(tabName) {
    // Hide all tab contents
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(content => content.classList.remove('active'));
    
    // Remove active class from all buttons
    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(button => button.classList.remove('active'));
    
    // Show selected tab
    document.getElementById(tabName).classList.add('active');
    
    // Add active class to clicked button
    event.target.classList.add('active');
    
    // Stop current camera stream if switching tabs
    if (currentStream) {
        stopCamera();
    }
}

// Start camera
async function startCamera(type) {
    try {
        // Request camera permission
        const stream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: 'environment', // Use back camera on mobile
                width: { ideal: 1280 },
                height: { ideal: 720 }
            }
        });
        
        currentStream = stream;
        const video = document.getElementById(`${type}-video`);
        const cameraBtn = document.getElementById(`${type}-camera-btn`);
        const captureBtn = document.getElementById(`${type}-capture-btn`);
        
        video.srcObject = stream;
        video.style.display = 'block';
        cameraBtn.style.display = 'none';
        captureBtn.style.display = 'inline-block';
        
        // Hide upload button
        const uploadBtn = document.getElementById(`${type}-upload-btn`);
        uploadBtn.style.display = 'none';
        
        // Hide previous image if any
        const preview = document.getElementById(`${type}-preview`);
        const retakeBtn = document.getElementById(`${type}-retake-btn`);
        const analyzeBtn = document.getElementById(`${type}-analyze-btn`);
        
        preview.style.display = 'none';
        retakeBtn.style.display = 'none';
        analyzeBtn.style.display = 'none';
        
    } catch (error) {
        console.error('Error accessing camera:', error);
        alert('Không thể truy cập camera. Vui lòng kiểm tra quyền truy cập camera của trình duyệt.');
    }
}

// Stop camera
function stopCamera() {
    if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
        currentStream = null;
    }
}

// Capture image
function captureImage(type) {
    const video = document.getElementById(`${type}-video`);
    const canvas = document.getElementById(`${type}-canvas`);
    const preview = document.getElementById(`${type}-preview`);
    const captureBtn = document.getElementById(`${type}-capture-btn`);
    const retakeBtn = document.getElementById(`${type}-retake-btn`);
    const analyzeBtn = document.getElementById(`${type}-analyze-btn`);
    
    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw video frame to canvas
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);
    
    // Convert to base64
    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    capturedImages[type] = imageData;
    
    // Show preview
    preview.src = imageData;
    preview.style.display = 'block';
    
    // Hide video and capture button, show retake and analyze buttons
    video.style.display = 'none';
    captureBtn.style.display = 'none';
    retakeBtn.style.display = 'inline-block';
    analyzeBtn.style.display = 'inline-block';
    
    // Stop camera stream
    stopCamera();
}

// Retake image
function retakeImage(type) {
    const video = document.getElementById(`${type}-video`);
    const preview = document.getElementById(`${type}-preview`);
    const cameraBtn = document.getElementById(`${type}-camera-btn`);
    const uploadBtn = document.getElementById(`${type}-upload-btn`);
    const retakeBtn = document.getElementById(`${type}-retake-btn`);
    const analyzeBtn = document.getElementById(`${type}-analyze-btn`);
    const results = document.getElementById(`${type}-results`);
    const fileInput = document.getElementById(`${type}-file-input`);
    
    // Hide preview and buttons
    preview.style.display = 'none';
    retakeBtn.style.display = 'none';
    analyzeBtn.style.display = 'none';
    results.style.display = 'none';
    
    // Show camera and upload buttons
    cameraBtn.style.display = 'inline-block';
    uploadBtn.style.display = 'inline-block';
    
    // Clear captured image and file input
    capturedImages[type] = null;
    fileInput.value = '';
}

// Analyze image
async function analyzeImage(type) {
    const loadingEl = document.getElementById(`${type}-loading`);
    const resultsEl = document.getElementById(`${type}-results`);
    const analyzeBtn = document.getElementById(`${type}-analyze-btn`);
    
    if (!capturedImages[type]) {
        alert('Vui lòng chụp ảnh trước khi phân tích!');
        return;
    }
    
    // Show loading
    loadingEl.style.display = 'block';
    resultsEl.style.display = 'none';
    analyzeBtn.disabled = true;
    
    try {
        const endpoint = type === 'fire' ? '/analyze_fire_extinguisher' : '/analyze_gauge';
        
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                image: capturedImages[type]
            })
        });
        
        const result = await response.json();
        
        // Hide loading
        loadingEl.style.display = 'none';
        analyzeBtn.disabled = false;
        
        if (result.status === 'success') {
            displayResults(type, null, result.image_url, result.api_response);
        } else {
            displayError(type, result.error || 'Có lỗi xảy ra trong quá trình phân tích', result.image_url);
        }
        
    } catch (error) {
        console.error('Error analyzing image:', error);
        loadingEl.style.display = 'none';
        analyzeBtn.disabled = false;
        displayError(type, 'Không thể kết nối đến server. Vui lòng thử lại.');
    }
}

// Display results
function displayResults(type, analysis, imageUrl, apiResponse) {
    const resultsEl = document.getElementById(`${type}-results`);
    
    let resultsHTML = '<h3>✅ Kết quả phân tích</h3>';
    
    // Hiển thị URL ảnh
    if (imageUrl) {
        resultsHTML += `
            <div class="result-item">
                <strong>🔗 URL ảnh:</strong>
                <span><a href="${imageUrl}" target="_blank">${imageUrl}</a></span>
            </div>
        `;
    }
    
    // Hiển thị raw API response nếu có (không có khung trượt)
    if (apiResponse) {
        resultsHTML += `
            <div class="result-item">
                <strong>📡 API Response:</strong>
                <pre style="background: #f5f5f5; padding: 15px; border-radius: 8px; font-size: 13px; white-space: pre-wrap; word-wrap: break-word; border: 1px solid #ddd;">${JSON.stringify(apiResponse, null, 2)}</pre>
            </div>
        `;
    }
    
    resultsEl.innerHTML = resultsHTML;
    resultsEl.style.display = 'block';
}

// Display error
function displayError(type, errorMessage, imageUrl) {
    const resultsEl = document.getElementById(`${type}-results`);
    
    let errorHTML = `
        <div class="error">
            <strong>❌ Lỗi:</strong> ${errorMessage}
        </div>
    `;
    
    // Hiển thị URL ảnh nếu có
    if (imageUrl) {
        errorHTML += `
            <div class="result-item" style="margin-top: 15px;">
                <strong>🔗 URL ảnh đã lưu:</strong>
                <span><a href="${imageUrl}" target="_blank">${imageUrl}</a></span>
            </div>
        `;
    }
    
    resultsEl.innerHTML = errorHTML;
    resultsEl.style.display = 'block';
}

// Trigger file upload
function triggerFileUpload(type) {
    const fileInput = document.getElementById(`${type}-file-input`);
    fileInput.click();
}

// Handle file upload
function handleFileUpload(type, input) {
    const file = input.files[0];
    if (!file) return;
    
    // Check if file is an image
    if (!file.type.startsWith('image/')) {
        alert('Vui lòng chọn file ảnh!');
        return;
    }
    
    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
        alert('File ảnh quá lớn! Vui lòng chọn file nhỏ hơn 10MB.');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const imageData = e.target.result;
        capturedImages[type] = imageData;
        
        // Show preview
        const preview = document.getElementById(`${type}-preview`);
        const retakeBtn = document.getElementById(`${type}-retake-btn`);
        const analyzeBtn = document.getElementById(`${type}-analyze-btn`);
        
        preview.src = imageData;
        preview.style.display = 'block';
        retakeBtn.style.display = 'inline-block';
        analyzeBtn.style.display = 'inline-block';
        
        // Hide camera elements
        const video = document.getElementById(`${type}-video`);
        const captureBtn = document.getElementById(`${type}-capture-btn`);
        video.style.display = 'none';
        captureBtn.style.display = 'none';
        
        // Stop camera if running
        if (currentStream) {
            stopCamera();
        }
    };
    
    reader.readAsDataURL(file);
}

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    // Check if browser supports camera
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert('Trình duyệt của bạn không hỗ trợ camera. Vui lòng sử dụng trình duyệt hiện đại khác.');
        return;
    }
    
    // Set initial tab
    showTab('fire-extinguisher');
});

// Handle page unload - stop camera
window.addEventListener('beforeunload', function() {
    stopCamera();
});
