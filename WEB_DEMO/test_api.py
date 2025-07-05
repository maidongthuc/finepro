#!/usr/bin/env python3
"""
Demo script để test chức năng chuyển đổi ảnh thành base64
và gửi đến API
"""

import base64
import requests
import json

def convert_image_to_base64(image_path):
    """Chuyển đổi ảnh thành base64 string"""
    try:
        with open(image_path, "rb") as image_file:
            encoded_image = base64.b64encode(image_file.read()).decode("utf-8")
        return encoded_image
    except FileNotFoundError:
        print(f"File không tồn tại: {image_path}")
        return None
    except Exception as e:
        print(f"Lỗi khi đọc file: {e}")
        return None

def test_local_api(data):
    """Test local Flask API"""
    try:
        response = requests.post(
            'http://localhost:5000/api/inspection',
            headers={'Content-Type': 'application/json'},
            json=data,
            timeout=30
        )
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        return response.json()
        
    except requests.exceptions.RequestException as e:
        print(f"Lỗi khi gọi local API: {e}")
        return None

def test_external_api(data):
    """Test external API trực tiếp"""
    try:
        response = requests.post(
            'http://0.0.0.0:8000/predict_image/',
            headers={
                'accept': 'application/json',
                'Content-Type': 'application/json'
            },
            json=data,
            timeout=30
        )
        
        print(f"External API Status Code: {response.status_code}")
        print(f"External API Response: {response.json()}")
        return response.json()
        
    except requests.exceptions.RequestException as e:
        print(f"Lỗi khi gọi external API: {e}")
        return None

def main():
    # Sample data
    sample_data = {
        "inspection_location": "Kiểm tra áp suất khí",
        "inspection_items_details": "Kiểm tra áp suất khí của bộ lọc hơi từ 5.5 → 7kg/cm2",
        "inspection_methods_standards": "Nhìn vào đồng hồ áp suất",
        "encoded_image": ""  # Sẽ được điền bằng base64 string
    }
    
    # Nếu có ảnh để test (thay đổi đường dẫn theo ảnh của bạn)
    image_path = "test_image.jpg"  # Thay đổi đường dẫn này
    
    # Tạo một base64 string giả để test
    sample_base64 = "/9j/4AAQSkZJRgABAQAAAQABAAD..."  # Sample base64
    
    # Thử chuyển đổi ảnh thật nếu có
    if image_path:
        encoded_image = convert_image_to_base64(image_path)
        if encoded_image:
            sample_data["encoded_image"] = encoded_image
            print(f"✅ Đã chuyển đổi ảnh thành base64 (length: {len(encoded_image)})")
        else:
            sample_data["encoded_image"] = sample_base64
            print("⚠️ Sử dụng base64 giả để test")
    else:
        sample_data["encoded_image"] = sample_base64
        print("⚠️ Sử dụng base64 giả để test")
    
    print("\n" + "="*50)
    print("TESTING LOCAL API")
    print("="*50)
    test_local_api(sample_data)
    
    print("\n" + "="*50)
    print("TESTING EXTERNAL API")
    print("="*50)
    test_external_api(sample_data)

if __name__ == "__main__":
    main()
