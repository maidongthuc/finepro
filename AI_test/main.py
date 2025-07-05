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

@app.get("/")
def read_root():
    return {"message": "Chào mừng đến với FastAPI!"}

@app.get("/items/{item_id}")
def read_item(item_id: int, q: str = None):
    return {"item_id": item_id, "query": q}

@app.post("/predict_image/")
def create_item(item: Item):

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
            {"type": "text", "text": f"""Inspection location: {item.inspection_location};
    Inspection items & details: {item.inspection_items_details};
    Inspection methods & standards: {item.inspection_methods_standards};"""},
            {"type": "image_url", "image_url": f"data:image/png;base64,{item.encoded_image}"},
        ]
    )
    ]

    ai_msg = llm.invoke(messages)
    return {
        "content": ai_msg.content
    }

# Thêm đoạn này để chạy bằng python main.py
if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
