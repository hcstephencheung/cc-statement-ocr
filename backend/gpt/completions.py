import os
import logging
from openai import OpenAI
from pydantic import BaseModel

from dotenv import load_dotenv
load_dotenv()

logger = logging.getLogger()

class Completions:
    def __init__(self, model="gpt-4.1"):
        self.model = model
        self.client = OpenAI(
            api_key=os.environ.get("OPEN_AI_API_KEY")
        )

    def ask(self, input, text, reasoning, tools, temperature=0.1, max_output_tokens=2048, top_p=1, store=True):
        response = self.client.responses.parse(
            model=self.model,
            input=input,
            text=text,
            reasoning=reasoning,
            tools=tools,
            temperature=temperature,
            max_output_tokens=max_output_tokens,
            top_p=top_p,
            store=store
        )
        return response.output_text

    def classify_csv_items(self, categories, descriptions):
        output_shape = """
        {
            [category]: {
                name: description, // description of financial item
                confidence: number // confidence level of the categorization
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
            - if a description doesn't belong to any predefined category, categorize it as "Uncategorized"
            - the output should be a JSON object with the following shape:
            - {output_shape}
            - any item that has confidence level lower than 0.6 should be categorized as "Uncategorized"
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
        for category in categories:
            output_schema[category] = { "type": "array", "items": [] }
        text_format = {
            "format": {
                "type": "json_schema",
                "name": "line_items",
                "schema": {
                    "type": "object",
                    "properties": output_schema,
                },
                "strict": True
            }
        }

        output = self.ask(
            input=[
                {
                    "role": "system",
                    "content": [
                        {
                            "type": "input_text",
                            "text": prompt
                        }
                    ]
                },
            ],
            text={
                "format": {
                    "type": "json_object"
                }
            },
            reasoning={},
            tools=[],
            temperature=0,
            max_output_tokens=2048,
            top_p=1,
            store=True
        )

        logger.info(f'Classified output: {output}')

        return output
