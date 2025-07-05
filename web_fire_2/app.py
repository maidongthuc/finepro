from flask import Flask, render_template, request, jsonify, url_for, send_from_directory
import base64
import io
from PIL import Image
import os
import datetime
import requests
from werkzeug.utils import secure_filename

app = Flask(__name__)

# Tạo thư mục images nếu chưa có
IMAGES_FOLDER = 'images'
app.config['UPLOAD_FOLDER'] = IMAGES_FOLDER
if not os.path.exists(IMAGES_FOLDER):
    os.makedirs(IMAGES_FOLDER)

# API endpoints
API_FIRE_EXTINGUISHER = 'http://18.234.31.162:8888/predict_interface_fire_extinguisher/'
API_GAUGE = 'http://18.234.31.162:8888/predict_clock_fire_extinguisher/'

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/analyze_fire_extinguisher', methods=['POST'])
def analyze_fire_extinguisher():
    try:
        # Nhận ảnh từ request
        image_data = request.json.get('image')
        
        if not image_data:
            return jsonify({'error': 'Không có ảnh được gửi'}), 400
        
        # Xử lý base64 image data
        image_data = image_data.split(',')[1]  # Loại bỏ "data:image/jpeg;base64,"
        image_binary = base64.b64decode(image_data)
        
        # Lưu ảnh vào thư mục images
        image = Image.open(io.BytesIO(image_binary))
        
        # Chuyển đổi RGBA sang RGB nếu cần (để lưu thành JPEG)
        if image.mode in ('RGBA', 'LA', 'P'):
            # Tạo background trắng
            background = Image.new('RGB', image.size, (255, 255, 255))
            if image.mode == 'P':
                image = image.convert('RGBA')
            # Paste ảnh lên background trắng
            background.paste(image, mask=image.split()[-1] if image.mode == 'RGBA' else None)
            image = background
        elif image.mode != 'RGB':
            image = image.convert('RGB')
        
        timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"fire_extinguisher_{timestamp}.jpg"
        filepath = os.path.join(IMAGES_FOLDER, filename)
        image.save(filepath, "JPEG", quality=95)
        
        # Tạo URL của ảnh để gửi cho API (sử dụng 127.0.0.1 thay vì localhost)
        image_url = url_for('get_image', filename=filename, _external=True)
        # Đảm bảo URL sử dụng 127.0.0.1
        image_url = image_url.replace('localhost', '127.0.0.1')
        print(f"Fire Extinguisher Image URL: {image_url}")
        
        # Gọi API phân tích bình chữa cháy
        try:
            print(f"Sending to API: {API_FIRE_EXTINGUISHER}")
            print(f"Payload: {{'encoded_image': '{image_url}'}}")
            
            api_response = requests.post(API_FIRE_EXTINGUISHER, 
                                       json={'encoded_image': image_url},
                                       headers={'accept': 'application/json', 'Content-Type': 'application/json'},
                                       timeout=30)
            
            print(f"API Response Status: {api_response.status_code}")
            print(f"API Response Body: {api_response.text}")
            
            if api_response.status_code == 200:
                api_result = api_response.json()
                # Xử lý response từ API
                result = {
                    'status': 'success',
                    'image_url': image_url,
                    'api_response': api_result
                }
            else:
                # Nếu API lỗi, chỉ trả về error và image_url
                result = {
                    'status': 'api_error',
                    'image_url': image_url,
                    'error': f'API Error: {api_response.status_code} - {api_response.text}'
                }
        except Exception as api_error:
            print(f"API Error: {str(api_error)}")
            # Nếu không kết nối được API, chỉ trả về error và image_url
            result = {
                'status': 'connection_error',
                'image_url': image_url,
                'error': f'Không thể kết nối API: {str(api_error)}'
            }
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({'error': f'Lỗi phân tích: {str(e)}'}), 500

@app.route('/analyze_gauge', methods=['POST'])
def analyze_gauge():
    try:
        # Nhận ảnh từ request
        image_data = request.json.get('image')
        
        if not image_data:
            return jsonify({'error': 'Không có ảnh được gửi'}), 400
        
        # Xử lý base64 image data
        image_data = image_data.split(',')[1]  # Loại bỏ "data:image/jpeg;base64,"
        image_binary = base64.b64decode(image_data)
        
        # Lưu ảnh vào thư mục images
        image = Image.open(io.BytesIO(image_binary))
        
        # Chuyển đổi RGBA sang RGB nếu cần (để lưu thành JPEG)
        if image.mode in ('RGBA', 'LA', 'P'):
            # Tạo background trắng
            background = Image.new('RGB', image.size, (255, 255, 255))
            if image.mode == 'P':
                image = image.convert('RGBA')
            # Paste ảnh lên background trắng
            background.paste(image, mask=image.split()[-1] if image.mode == 'RGBA' else None)
            image = background
        elif image.mode != 'RGB':
            image = image.convert('RGB')
        
        timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"gauge_{timestamp}.jpg"
        filepath = os.path.join(IMAGES_FOLDER, filename)
        image.save(filepath, "JPEG", quality=95)
        
        # Tạo URL của ảnh để gửi cho API (sử dụng 127.0.0.1 thay vì localhost)
        image_url = url_for('get_image', filename=filename, _external=True)
        # Đảm bảo URL sử dụng 127.0.0.1
        image_url = image_url.replace('localhost', '127.0.0.1')
        print(f"Gauge Image URL: {image_url}")
        
        # Gọi API phân tích đồng hồ
        try:
            print(f"Sending to API: {API_GAUGE}")
            print(f"Payload: {{'encoded_image': '{image_url}'}}")
            
            api_response = requests.post(API_GAUGE, 
                                       json={'encoded_image': image_url},
                                       headers={'accept': 'application/json', 'Content-Type': 'application/json'},
                                       timeout=30)
            
            print(f"API Response Status: {api_response.status_code}")
            print(f"API Response Body: {api_response.text}")
            
            if api_response.status_code == 200:
                api_result = api_response.json()
                # Xử lý response từ API
                result = {
                    'status': 'success',
                    'image_url': image_url,
                    'api_response': api_result
                }
            else:
                # Nếu API lỗi, chỉ trả về error và image_url
                result = {
                    'status': 'api_error',
                    'image_url': image_url,
                    'error': f'API Error: {api_response.status_code} - {api_response.text}'
                }
        except Exception as api_error:
            print(f"API Error: {str(api_error)}")
            # Nếu không kết nối được API, chỉ trả về error và image_url
            result = {
                'status': 'connection_error',
                'image_url': image_url,
                'error': f'Không thể kết nối API: {str(api_error)}'
            }
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({'error': f'Lỗi phân tích: {str(e)}'}), 500

@app.route('/image/<filename>')
def get_image(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5050)
