import sys
import os

# Add the project root directory to the Python path
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, project_root)

import base64
from src.llm_gemini import llm
from langchain_core.messages import HumanMessage, SystemMessage

# messages = [
#     SystemMessage(content="You are a helpful assistant that translates English to French. Translate the user sentence."),
#     HumanMessage(content="I love programming."),
# ]

# messages = [
#     SystemMessage(content="You are a helpful assistant. You will describe images. Reply in vietnamese"),
#     HumanMessage(
#         content=[
#             {
#                 "type": "text",
#                 "text": "Describe the image at the URL.",
#             },
#             {"type": "image_url", "image_url": "https://picsum.photos/seed/picsum/200/300"},
#         ]
#     )
# ]

image_file_path = "./images/clock.jpg"

with open(image_file_path, "rb") as image_file:
    encoded_image = base64.b64encode(image_file.read()).decode("utf-8")

# Save encoded image to text file
with open("encoded_image.txt", "w") as txt_file:
    txt_file.write(encoded_image)

print("Encoded image saved to encoded_image.txt")
print(encoded_image)
messages = [
    SystemMessage(content="""You are an equipment inspection engineer. I will provide you with the following information:

Inspection location: [location of inspection]

Inspection items & details: [inspection items and target values]

Inspection methods & standards: [how the inspection is performed and what standards to follow]

Image: [photo of the equipment]

Please evaluate and respond in the following format:

Result: OK / Not OK

Reason: Briefly explain why you chose that result, based on the image and inspection criteria."""),
    HumanMessage(
    content=[
        {"type": "text", "text": """Inspection location: Kiểm tra áp suất khí
Inspection items & details: Kiểm tra áp suất khí của bộ lọc hơi từ 5.5 → 7kg/cm2
Inspection methods & standards: Nhìn vào đồng hồ áp suất"""},
        {"type": "image_url", "image_url": f"data:image/png;base64,{encoded_image}"},
    ]
)
]

ai_msg = llm.invoke(messages)
print(ai_msg.content)