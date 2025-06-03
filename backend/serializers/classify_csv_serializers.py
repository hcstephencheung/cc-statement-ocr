from typing import Any, Dict

from pydantic import BaseModel


class LineItem(BaseModel):
    description: str
    quantity: int
    unit_price: float
    total_price: float

    @classmethod
    def validate(cls, data: Dict[str, Any]):
        if not isinstance(data.get("description"), str) or not data["description"].strip():
            raise ValueError("description must be a non-empty string")
        if not isinstance(data.get("quantity"), int) or data["quantity"] < 0:
            raise ValueError("quantity must be a non-negative integer")
        if not isinstance(data.get("unit_price"), (int, float)) or data["unit_price"] < 0:
            raise ValueError("unit_price must be a non-negative number")
        if not isinstance(data.get("total_price"), (int, float)) or data["total_price"] < 0:
            raise ValueError("total_price must be a non-negative number")
        return cls(**data)