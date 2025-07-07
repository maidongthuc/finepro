import requests
from PIL import Image
from io import BytesIO

def read_image(url_image):
    """
    Reads an image from a URL and return width and height.
    """
    response = requests.get(url_image)
    image = Image.open(BytesIO(response.content))
    w, h = image.size[:2]
    return w, h

def bounding_boxes(detections, w, h):
    """
    
    """
    results = []
    for idx, det in enumerate(detections):
        # LLM return normalized coordinates (0-1000), need to scale to actual pixel values
        y1, x1, y2, x2 = det["box_2d"]
        label = det["label"]
        
        # Scale normalized coordinates (0-1000) to actual image dimensions
        y1 = y1 / 1000 * h
        x1 = x1 / 1000 * w
        y2 = y2 / 1000 * h
        x2 = x2 / 1000 * w
        
        # Ensure coordinates are in correct order
        if x1 > x2:
            x1, x2 = x2, x1  # Swap x-coordinates if needed
        if y1 > y2:
            y1, y2 = y2, y1  # Swap y-coordinates if needed
        
        # Convert to integers
        x1, y1, x2, y2 = int(x1), int(y1), int(x2), int(y2)
        results.append({
            "box_2d": [y1, x1, y2, x2],
            "label": label
        })
    return results
        