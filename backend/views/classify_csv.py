import json
from fastapi import APIRouter, HTTPException
from utils.logger import setup_logger
from csv_processor.pipeline import CsvProcessorPipeline

from serializers.csv_serializers import ClassifyCsvResponse, ClassifyRequest

logger = setup_logger()
csv_router = APIRouter(prefix="/api/csv")

CsvProcessorClient = CsvProcessorPipeline()

@csv_router.get("/ping")
async def ping():
    return "CSV classification service is up and running"

@csv_router.post("/classify", response_model=ClassifyCsvResponse)
async def classify_line_items(request: ClassifyRequest):
    try:
        # Validate and process each line item
        line_items = request.line_items
        categories = request.desired_categories

        descriptions = [item.description for item in line_items]

        classified_items = CsvProcessorClient.classify_csv_items(categories, descriptions)

        return { "classified_items": classified_items }
    
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
