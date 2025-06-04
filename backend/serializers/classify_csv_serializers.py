from typing import Any, Dict, List
from pydantic import BaseModel


class LineItem(BaseModel):
    date: str
    description: str
    debit: bool
    amount: float

    @classmethod
    def validate(cls, data: Dict[str, Any]):
        if not isinstance(data.get("date"), str) or not data["date"].strip():
            raise ValueError("date must be a non-empty string")
        if not isinstance(data.get("description"), str) or not data["description"].strip():
            raise ValueError("description must be a non-empty string")
        if not isinstance(data.get("debit"), bool):
            raise ValueError("debit must be a boolean")
        if not isinstance(data.get("amount"), (int, float)):
            raise ValueError("amount must be a number")
        return cls(**data)
    
class ClassifyRequest(BaseModel):
    line_items: List[LineItem]
