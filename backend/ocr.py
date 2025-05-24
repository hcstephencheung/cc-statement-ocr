from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any
import easyocr
import requests
from PIL import Image
import io
import numpy as np

ocr_router = APIRouter(prefix="/ocr")

class OCRRequest(BaseModel):
    imageUrl: str
    read_per_line: bool = False

    @classmethod
    def validate(cls, data: Dict[str, Any]):
        if not isinstance(data.get("imageUrl"), str) or not data["imageUrl"].strip():
            raise ValueError("imageUrl must be a non-empty string")
        if not isinstance(data.get("read_per_line"), bool):
            raise ValueError("read_per_line must be a boolean")
        return cls(**data)

@ocr_router.get('/ping')
async def ping():
    return "OCR service is up"

@ocr_router.post("/parse", response_model=Dict[str, List[Dict[str, Any]]])
async def perform_ocr(request: OCRRequest):
    url = request.imageUrl
    read_per_line = request.read_per_line
    try:
        # Download image
        response = requests.get(url)
        response.raise_for_status()
        image_bytes = response.content
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")

        # Run EasyOCR
        reader = easyocr.Reader(['en'])  # Add 'ch_sim' if you have Chinese too
        results = reader.readtext(np.array(image), width_ths=0.5, ycenter_ths=0.5)

        # Format OCR output
        ocr_results = [
            {
                "text": text, 
                "confidence": float(conf),  # Convert numpy.float to Python float
            }
            for bbox, text, conf in results
        ]

        per_line_results = []  # Initialize per_line_results
        if read_per_line:
            # Perform per-line OCR if needed
            per_line_results = reader.readtext(np.array(image), width_ths=600, ycenter_ths=0.5)
            per_line_results = [
                {
                    "text": text,
                    "confidence": float(conf),
                }
                for bbox, text, conf in per_line_results
            ]

        return { "primary": ocr_results, "per_line_results": per_line_results }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))