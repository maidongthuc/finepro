from fastapi import FastAPI, HTTPException, Request, UploadFile, File
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

@app.post("/upload_image/")
async def upload_image(file: UploadFile = File(...), request: Request = None):
    try:
        # Check file extension instead of content-type
        allowed_extensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp']
        file_extension = os.path.splitext(file.filename)[1].lower()
        
        if file_extension not in allowed_extensions:
            raise HTTPException(status_code=400, detail="File must be an image (jpg, jpeg, png, gif, bmp, webp)")
        
        # Create images directory if it doesn't exist
        images_dir = "images"
        if not os.path.exists(images_dir):
            os.makedirs(images_dir)
        
        # Save uploaded file
        file_path = os.path.join(images_dir, file.filename)
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        # Get the base URL from the request
        base_url = f"{request.url.scheme}://{request.url.netloc}"
        image_url = f"{base_url}/images/{file.filename}"
        
        return {
            "message": "success",
            "url": image_url,
            "filename": file.filename
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error uploading image: {str(e)}")

@app.get("/images/{filename}")
def get_image(filename: str):
    image_path = os.path.join("images", filename)
    if os.path.exists(image_path):
        return FileResponse(image_path)
    else:
        raise HTTPException(status_code=404, detail="Image not found")
    
if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8080, reload=True)