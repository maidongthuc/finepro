from fastapi import FastAPI, HTTPException, Request
from pydantic import BaseModel
import uvicorn
from src.llm_gemini import llm
from src.prompt import preprocessing_prompt
from src.info_image import read_image, bounding_boxes
import json
from fastapi.responses import FileResponse
import os
import shutil

app = FastAPI()

class Object_Detection(BaseModel):
    objects: str = None
    url_image: str

class ImagePath(BaseModel):
    image_path: str

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

@app.post("/save_and_get_image/")
def save_and_get_image(image_data: ImagePath, request: Request):
    try:
        # Check if source image exists
        if not os.path.exists(image_data.image_path):
            raise HTTPException(status_code=404, detail="Source image not found")
        
        # Create images directory if it doesn't exist
        images_dir = "images"
        if not os.path.exists(images_dir):
            os.makedirs(images_dir)
        
        # Get filename from the source path
        filename = os.path.basename(image_data.image_path)
        
        # Destination path
        destination_path = os.path.join(images_dir, filename)
        
        # Copy the image to images folder
        shutil.copy2(image_data.image_path, destination_path)
        
        # Get the base URL from the request
        base_url = f"{request.url.scheme}://{request.url.netloc}"
        image_url = f"{base_url}/images/{filename}"
        
        return {
            "message": "success",
            "url": image_url,
            "filename": filename
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error saving image: {str(e)}")

@app.get("/images/{filename}")
def get_image(filename: str):
    image_path = os.path.join("images", filename)
    if os.path.exists(image_path):
        return FileResponse(image_path)
    else:
        raise HTTPException(status_code=404, detail="Image not found")
    
if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8080, reload=True)