from typing import List, Tuple, Dict, Any

def build_classify_csv_prompt(
    categories: List[str],
    descriptions: List[str],
) -> Tuple[str, Dict[str, Any], Dict[str, Any]]:
    output_shape = """
    {
        [category]: {
            name: description, // description of financial item
            confidence: number // confidence level of the categorization
            reason: string // reasoning for confidence level
        }
    }
    """
    extra_rules = """
        - "pets plus us" categorizes to "Gimbap Insurance""
        - "petsmart" categorizes to "Pet food"
        - "coquitlam" categorizes to "EV Charging+ parking" because it refers to city parking
        - "payment from -" categorizes to debit
        - "body energy club" categorizes to "food"
        - "uber eats" categorizes to "food"
    """
    prompt = f"""
        Imagine you are a general accountant and I am a Canadian consumer living in Vancouver, B.C. I will provide you with 2 arrays. The first array will include a list of categories. The second array will include a list of financial statement descriptions. You must do the following:
        - categorize each description to the predefined category as best as you can
        - if a description doesn't belong to any predefined category, categorize it as "uncategorized"
        - the output should be a JSON object with the following shape:
        - {output_shape}
        - any item that has confidence level lower than 0.6 should be categorized as "uncategorized"
        - summarize your reasoning for the confidence level in a single sentence
        - do not assume order specifics, categorize solely based on description
        - do not make up any descriptions
        - do not change the descriptions
        - the keys of the output object must match the first array
        - for each description, if it matches a company name, use the context of the company to help categorize
        - in general, groceries categorizes to "food"

        Follow these extra rules:
        {extra_rules}

        The inputs will follow === inputs === and separated by newline.
        === inputs ===
        {categories}\n
        {descriptions}
    """
    output_schema = {}
    item_schema = {
        "type": "object",
        "properties": {
            "name": { "type": "string" },
            "confidence": { "type": "number", "minimum": 0, "maximum": 1 },
            "reason": { "type": "string" }
        },
        "required": ["name", "confidence", "reason"],
        "additionalProperties": False
    }
    for category in categories:
        output_schema[category] = {
            "type": "array",
            "items": item_schema
        }
    text_format = {
        "format": {
            "type": "json_schema",
            "name": "line_items",
            "schema": {
                "type": "object",
                "properties": output_schema,
                "additionalProperties": False,
                "required": list(output_schema.keys()),
            },
            "strict": True
        }
    }

    return prompt, text_format