from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any

from serializers.classify_csv_serializers import LineItem

csv_router = APIRouter(prefix="/api/csv")

class ClassifyRequest(BaseModel):
    line_items: List[LineItem]

@csv_router.post("/classify", response_model=Dict[str, List[Dict[str, Any]]])
async def classify_line_items(request: ClassifyRequest):
    try:
        # Validate and process each line item
        validated_items = [LineItem.validate(item.dict()) for item in request.line_items]
        
        # Here you would implement your classification logic
        # For demonstration, we will just return the validated items
        classified_items = [{"description": item.description, "quantity": item.quantity, "unit_price": item.unit_price, "total_price": item.total_price} for item in validated_items]
        
        return {"classified_items": classified_items}
    
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
