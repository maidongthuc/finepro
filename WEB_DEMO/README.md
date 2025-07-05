# 🔍 Inspection Management System

Hệ thống quản lý kiểm tra được xây dựng bằng Flask với giao diện web hiện đại.

## ✨ Tính năng

- Quản lý thông tin kiểm tra
- Upload và xử lý hình ảnh
- API RESTful
- Giao diện web responsive
- Health check endpoint
- Docker support

## 🚀 Cách chạy ứng dụng

### Sử dụng Docker (Khuyến nghị)

1. **Build và chạy với Docker Compose:**
```bash
docker-compose up --build
```

2. **Hoặc build và chạy với Docker:**
```bash
# Build image
docker build -t inspection-app .

# Chạy container
docker run -p 5000:5000 inspection-app
```

3. **Truy cập ứng dụng:**
   - Web: http://localhost:5000
   - Health check: http://localhost:5000/api/health

### Chạy local (Development)

1. **Cài đặt dependencies:**
```bash
pip install -r requirements.txt
```

2. **Chạy ứng dụng:**
```bash
python main.py
```

## 📁 Cấu trúc dự án

```
WEB_DEMO/
├── Dockerfile              # Docker configuration
├── docker-compose.yml      # Docker Compose configuration
├── requirements.txt        # Python dependencies
├── main.py                 # Flask application
├── static/                 # Static files (CSS, JS)
│   ├── css/
│   └── js/
└── templates/              # HTML templates
    └── index.html
```

## 🔧 Environment Variables

- `FLASK_DEBUG`: Debug mode (default: True)
- `PORT`: Port number (default: 5000)
- `HOST`: Host address (default: 0.0.0.0)
- `EXTERNAL_API_URL`: URL of external prediction API (default: http://0.0.0.0:8000/predict_image/)
- `EXTERNAL_API_TIMEOUT`: Timeout for external API calls (default: 30)
- `MAX_CONTENT_LENGTH`: Maximum file upload size (default: 16MB)

## 📋 API Endpoints

- `GET /` - Trang chủ
- `POST /api/inspection` - API xử lý dữ liệu kiểm tra
- `GET /api/health` - Health check endpoint

## 🛠️ Technologies

- **Backend**: Flask (Python)
- **Frontend**: HTML, CSS, JavaScript
- **Containerization**: Docker, Docker Compose
- **AI/ML**: LangChain Google GenAI

## 🖼️ Xử lý ảnh và Base64

Hệ thống hỗ trợ upload ảnh và tự động chuyển đổi thành base64 để gửi đến API external.

### Workflow xử lý ảnh:

1. **Upload ảnh**: Người dùng upload ảnh qua giao diện web
2. **Chuyển đổi Base64**: JavaScript tự động chuyển ảnh thành base64 string
3. **Gửi API**: Dữ liệu được gửi đến Flask backend
4. **Forward API**: Flask forward dữ liệu đến external API (`http://0.0.0.0:8000/predict_image/`)
5. **Trả kết quả**: Kết quả được trả về giao diện

### Cấu trúc dữ liệu API:

```json
{
  "inspection_location": "Kiểm tra áp suất khí",
  "inspection_items_details": "Kiểm tra áp suất khí của bộ lọc hơi từ 5.5 → 7kg/cm2",
  "inspection_methods_standards": "Nhìn vào đồng hồ áp suất",
  "encoded_image": "/9j/4AAQSkZJRgABAQAAAQABAAD..."
}
```

### Test API:

```bash
# Chạy script test
python test_api.py

# Hoặc test manual với curl
curl -X POST http://localhost:5000/api/inspection \
  -H "Content-Type: application/json" \
  -d @test_data.json
```

## 📝 License

MIT License