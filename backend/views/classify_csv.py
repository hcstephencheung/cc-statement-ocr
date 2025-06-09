import json
import logging
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any
from gpt.completions import Completions

from serializers.classify_csv_serializers import ClassifyRequest, LineItem

logger = logging.getLogger()
csv_router = APIRouter(prefix="/api/csv")

CompletionsClient = Completions()

@csv_router.get("/ping")
async def ping():
    return "CSV classification service is up and running"

@csv_router.post("/classify")
async def classify_line_items(request: ClassifyRequest):
    try:
        # Validate and process each line item
        # validated_items = [LineItem.validate(item.dict()) for item in request.line_items]
        line_items = request.line_items
        categories = request.desired_categories

        descriptions = [item.description for item in line_items]

        classified_items = CompletionsClient.classify_csv_items(categories, descriptions)
        classified_items_json = json.loads(classified_items)

        return {
            "classified_items": classified_items_json
        }
    
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
