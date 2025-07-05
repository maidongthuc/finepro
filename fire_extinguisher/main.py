from fastapi import FastAPI
from pydantic import BaseModel
import uvicorn
from src.llm_gemini import llm
from langchain_core.messages import HumanMessage, SystemMessage

app = FastAPI()

class Item(BaseModel):
    inspection_location: str
    inspection_items_details: str
    inspection_methods_standards: str
    encoded_image: str = None 

class Body_fire(BaseModel):
    encoded_image: str = None 

class Clock_fire(BaseModel):
    encoded_image: str = None 

@app.get("/")
def read_root():
    return {"message": "Chào mừng đến với FastAPI!"}

@app.post("/predict_interface_fire_extinguisher/")
def create_item(body_fire: Body_fire):
    messages = [
        SystemMessage(content="""
    You are an AI inspector for fire extinguishers. When I provide an image of a fire extinguisher, analyze it and evaluate the following components:
    1. **Body (Thân bình)**: Is it **OK** or **NOT OK**? Clearly state the reason (e.g., dented, rusted, label missing, etc.).
    2. **Handle (Cò bóp)**: Is it **OK** or **NOT OK**? Clearly state the reason (e.g., broken, bent, missing part, etc.).
    3. **Safety pin (Chốt an toàn)**: Is it **OK** or **NOT OK**? Clearly state the reason (e.g., missing, not secured, damaged, etc.).
    4. **Nozzle (Vòi phun)**: Is it **OK** or **NOT OK**? Clearly state the reason (e.g., cracked, blocked, detached, etc.).

    If any part is not clearly visible (too small, blurry, occluded), return the status as **NO OK** and explain which part is unclear.

    IMPORTANT: You must respond ONLY with valid JSON in this exact format. Do not include any explanatory text, markdown formatting, or code blocks. Just return the raw JSON object:

    {
    "than_binh": {
        "status": "OK/NOT OK",
        "reason": "[Lý do cụ thể]"
    },
    "co_bop": {
        "status": "OK/NOT OK", 
        "reason": "[Lý do cụ thể]"
    },
    "chot_an_toan": {
        "status": "OK/NOT OK",
        "reason": "[Lý do cụ thể]"
    },
    "voi_phun": {
        "status": "OK/NOT OK",
        "reason": "[Lý do cụ thể]"
    }
    }"""),
            HumanMessage(
            content=[
                {"type": "image_url", "image_url": f"{body_fire.encoded_image}"},
            ]
        )
        ]

    ai_msg = llm.invoke(messages)
    try:
        import json
        response_data = json.loads(ai_msg.content)
        return response_data
    except:
        # If JSON parsing fails, return the raw content
        return {
            "content": ai_msg.content
        }
    
@app.post("/predict_clock_fire_extinguisher/")
def create_item(clock_fire: Clock_fire):
    messages = [
        SystemMessage(content="""
Bạn là chuyên gia kiểm tra đồng hồ áp suất bình chữa cháy. Khi tôi cung cấp hình ảnh đồng hồ áp suất, hãy phân tích và đánh giá:

**ĐỒNG HỒ ÁP SUẤT (Pressure Gauge):**
- Xác định vị trí kim đồng hồ trong các vùng màu:
  + **VÙNG XANH (GREEN)**: Áp suất bình thường, trạng thái OK
  + **VÙNG ĐỎ (RED)**: Áp suất thấp, cần nạp lại, trạng thái NOT OK  
  + **VÙNG VÀNG (YELLOW)**: Áp suất cao/quá tải, trạng thái NOT OK
  
- Kiểm tra tình trạng đồng hồ:
  + Kim đồng hồ có bị gãy, kẹt hay mất không?
  + Mặt đồng hồ có bị nứt, vỡ hay mờ không?
  + Các vùng màu có rõ ràng không?

    If any part is not clearly visible (too small, blurry, occluded), return the status as **NO OK** and explain which part is unclear.

    IMPORTANT: You must respond ONLY with valid JSON in this exact format. Do not include any explanatory text, markdown formatting, or code blocks. Just return the raw JSON object:
{
  "dong_ho_ap_suat": {
    "status": "OK/NOT OK/NEED RETAKE",
    "reason": "[Mô tả chi tiết vị trí kim trong vùng màu nào và lý do đánh giá]"
  }
}"""),
        HumanMessage(
            content=[
                {"type": "image_url", "image_url": f"{clock_fire.encoded_image}"},
            ]
        )
    ]

    ai_msg = llm.invoke(messages)
    try:
        import json
        response_data = json.loads(ai_msg.content)
        return response_data
    except:
        # If JSON parsing fails, return the raw content
        return {
            "content": ai_msg.content
        }
# Thêm đoạn này để chạy bằng python main.py
if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8888, reload=True)
