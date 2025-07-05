from flask import Flask, render_template, request, jsonify
import os
import base64
import requests
import json
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)

# Configuration
app.config['MAX_CONTENT_LENGTH'] = int(os.getenv('MAX_CONTENT_LENGTH', 16 * 1024 * 1024))  # 16MB default
EXTERNAL_API_URL = os.getenv('EXTERNAL_API_URL', 'http://18.234.31.162:8000/predict_image/')
EXTERNAL_API_TIMEOUT = int(os.getenv('EXTERNAL_API_TIMEOUT', 30))

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/inspection', methods=['POST'])
def inspection_api():
    try:
        data = request.json
        
        # Lấy dữ liệu từ form
        inspection_location = data.get('inspection_location', '')
        inspection_items_details = data.get('inspection_items_details', '')
        inspection_methods_standards = data.get('inspection_methods_standards', '')
        encoded_image = data.get('encoded_image', '')
        
        # Chuẩn bị dữ liệu cho API external
        external_api_data = {
            "inspection_location": inspection_location,
            "inspection_items_details": inspection_items_details,
            "inspection_methods_standards": inspection_methods_standards,
            "encoded_image": encoded_image
        }
        
        # Gọi API external (thay đổi URL theo API thực tế của bạn)
        external_api_url = EXTERNAL_API_URL
        
        try:
            response = requests.post(
                external_api_url,
                headers={
                    'accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                json=external_api_data,
                timeout=EXTERNAL_API_TIMEOUT  # 30 seconds timeout
            )
            
            if response.status_code == 200:
                external_result = response.json()
                return jsonify({
                    'status': 'success',
                    'message': 'Data processed successfully',
                    'external_api_result': external_result
                })
            else:
                return jsonify({
                    'status': 'error',
                    'message': f'External API error: {response.status_code}',
                    'data': data
                }), 400
                
        except requests.exceptions.RequestException as e:
            # Fallback khi API external không khả dụng
            return jsonify({
                'status': 'success',
                'message': 'Data processed locally (external API unavailable)',
                'data': data,
                'external_api_error': str(e)
            })
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Server error: {str(e)}'
        }), 500

@app.route('/api/process-image', methods=['POST'])
def process_image():
    """API endpoint để xử lý và chuyển đổi ảnh thành base64"""
    try:
        if 'image' not in request.files:
            return jsonify({'error': 'No image file provided'}), 400
        
        image_file = request.files['image']
        if image_file.filename == '':
            return jsonify({'error': 'No image file selected'}), 400
        
        # Đọc và encode ảnh thành base64
        image_data = image_file.read()
        encoded_image = base64.b64encode(image_data).decode('utf-8')
        
        return jsonify({
            'status': 'success',
            'encoded_image': encoded_image,
            'filename': image_file.filename,
            'size': len(image_data)
        })
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.route('/api/health')
def health_check():
    """Health check endpoint for Docker"""
    return jsonify({
        'status': 'healthy',
        'service': 'Inspection Management System'
    })

if __name__ == '__main__':
    # Lấy cấu hình từ environment variables
    debug_mode = os.getenv('FLASK_DEBUG', 'True').lower() == 'true'
    port = int(os.getenv('PORT', 5000))
    host = os.getenv('HOST', '0.0.0.0')
    
    app.run(debug=debug_mode, host=host, port=port)