import easyocr
import requests
from PIL import Image
import io
import numpy as np
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, validator
from typing import List, Dict, Any
from fastapi import FastAPI
from utils.logger import setup_logger
from views.ocr import ocr_router
from views.classify_csv import csv_router

logger = setup_logger()

# Define FastAPI app
app = FastAPI()

# Include the OCR router
app.include_router(ocr_router)
app.include_router(csv_router)


@app.get('/ping')
async def ping():
    return "backend server is up"

