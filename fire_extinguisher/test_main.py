from src.llm_gemini import llm
from langchain_core.messages import HumanMessage, SystemMessage
import base64

image_file_path = "./images/fire14.png"
image_file_path_2 = "./images/fire16.png"
with open(image_file_path, "rb") as image_file:
    encoded_image = base64.b64encode(image_file.read()).decode("utf-8")

with open(image_file_path_2, "rb") as image_file_2:
    encoded_image_2 = base64.b64encode(image_file_2.read()).decode("utf-8")
with open("encoded_image.txt", "w") as f:
    f.write(encoded_image)
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

Nếu đồng hồ không rõ ràng (mờ, nhỏ, bị che khuất, không nhìn thấy kim), trả về "NEED RETAKE".

QUAN TRỌNG: Chỉ trả về JSON thuần túy theo định dạng chính xác này, không thêm text giải thích hay markdown:

{
  "dong_ho_ap_suat": {
    "status": "OK/NOT OK/NEED RETAKE",
    "reason": "[Mô tả chi tiết vị trí kim trong vùng màu nào và lý do đánh giá]"
  }
}"""),
        HumanMessage(
            content=[
                {"type": "image_url", "image_url": f"data:image/png;base64,{encoded_image}"},
            ]
        )
    ]

ai_msg = llm.invoke(messages)
# print("Raw AI response:")
# print(repr(ai_msg.content))
# print("Length:", len(ai_msg.content))
print("Content:")
print(ai_msg.content)

# import json
# response_data = json.loads(ai_msg.content)
# print("Successfully parsed JSON:")
# print(response_data)