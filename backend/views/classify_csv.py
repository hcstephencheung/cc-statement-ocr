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

        # TODO: get this from the UI
        categories = ["Mortgage", "Strata Fees", "Storage Rental", "Electric Bill", "Internet Bill", "Property Tax", "Home Insurance", "Misc. Home improvement", "Food", "debit", "Gimbap Insurance", "Pet food", "Vet", "EV charging+ parking", "Car insurance", "Car maintenance", "Other", "Entertainment", "Vacation planning", "shopping", "Uncategorized"]
        descriptions = [item.description for item in line_items]

        classified_items = CompletionsClient.classify_csv_items(categories, descriptions)
        classified_items_json = json.loads(classified_items)

        return {
            "classified_items": classified_items_json
        }
    
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
