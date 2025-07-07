from fastapi import FastAPI
from pydantic import BaseModel
import uvicorn
from src.llm_gemini import llm
from src.prompt import preprocessing_prompt
from src.info_image import read_image, bounding_boxes
import json

app = FastAPI()

class Object_Detection(BaseModel):
    objects: str = None
    url_image: str

@app.get("/")
def read_root():
    return {"message": "Chào mừng đến với FastAPI!"}

@app.post("/object_detection/")
def create_item(object_detection: Object_Detection):
    messages = preprocessing_prompt(
        objects=object_detection.objects,
        encoded_image=object_detection.url_image
    )
    w,h = read_image(object_detection.url_image)
    ai_msg = llm.invoke(messages)
    try:
        detections = json.loads(ai_msg.content)
        response_data = bounding_boxes(detections, w, h)
        return response_data
    except:
        return {
            "content": ai_msg.content
        }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8080, reload=True)