from langchain_core.messages import HumanMessage, SystemMessage

def preprocessing_prompt(objects, encoded_image):
    messages = [
        SystemMessage(
        content="Respond ONLY with a raw JSON array containing 2D bounding boxes and labels. DO NOT add explanations, markdown, or code blocks. Format: [{\"box_2d\": [ymin, xmin, ymax, xmax], \"label\": \"object\"}]."
        ),
        HumanMessage(
        content=[
            {"type": "text", "text": f"Detect the 2d bounding boxes of the following objects: *{objects}*."},
            {"type": "image_url", "image_url": f"{encoded_image}"},
        ]
        )
    ]
    return messages