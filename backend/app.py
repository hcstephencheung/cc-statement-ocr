import easyocr
import requests
from PIL import Image
import io
import numpy as np
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, validator
from typing import List, Dict, Any

# Define FastAPI app
app = FastAPI()

# Define request body model
class OCRRequest(BaseModel):
    imageUrl: str

    @classmethod
    def validate(cls, data: Dict[str, Any]):
        if not isinstance(data.get("imageUrl"), str) or not data["imageUrl"].strip():
            raise ValueError("imageUrl must be a non-empty string")
        return cls(**data)


@app.get('/ping')
async def ping():
    return {"message": "omg this is great"}


@app.post("/ocr", response_model=List[Dict[str, Any]])
async def perform_ocr(request: OCRRequest):
    url = request.imageUrl
    try:
        # Download image
        response = requests.get(url)
        response.raise_for_status()
        image_bytes = response.content
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")

        # Run EasyOCR
        reader = easyocr.Reader(['en'])  # Add 'ch_sim' if you have Chinese too
        results = reader.readtext(np.array(image), width_ths=0.7, ycenter_ths=1.5)

        # Format OCR output
        ocr_results = [
            {
                "text": text, 
                "confidence": float(conf),  # Convert numpy.float to Python float
            }
            for bbox, text, conf in results
        ]

        return ocr_results
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
