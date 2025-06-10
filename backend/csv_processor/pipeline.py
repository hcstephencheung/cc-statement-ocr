import json
from serializers.csv_serializers import ClassifiedCategoryDescriptions, ClassifiedDescriptionsCategories
from utils.logger import setup_logger
from gpt.prompts import build_classify_csv_prompt
from gpt.completions import Completions

logger = setup_logger()

class CsvProcessorPipeline:
    def __init__(self):
        self.gpt_client = Completions(model="gpt-4.1")

    def preprocess_descriptions(self, requested_descriptions):
        """
        Check if categories requested are cached. return un-cached categories.
        """
        if not requested_descriptions:
            return []

        deduplicated_descriptions = list(set(requested_descriptions))
        return deduplicated_descriptions
    
    def postprocess_descriptions(self, classified_categories_descriptions: ClassifiedCategoryDescriptions):
        """
        Add newly processed categories to the cache.
        """
        logs = ''
        descriptions_categories_dict = {}
        for category, descriptions in classified_categories_descriptions.items():
            for description in descriptions:
                description_name = f'{description["name"]}' if description['name'] else None

                if description_name is not None:
                    descriptions_categories_dict[description_name] = category
                    logs = f'{logs}\n{description_name} was categorized as {category} at {description["confidence"]}. Reason: {description["reason"]}'

        logger.info(f'Post processed CSV items: \n{logs}')
        return descriptions_categories_dict

    
    def classify_csv_items(self, categories: str, descriptions: str) -> ClassifiedDescriptionsCategories:
        """
        Classify descriptions into categories using GPT. Categories and descriptions will be
        de-duplicated before processing. Results will be cached on instance to reduce cost.
        """
        deduplicated_categories = list(set(categories))
        unclassified_descriptions = self.preprocess_descriptions(descriptions)

        if len(unclassified_descriptions) == 0:
            # return early if empty, skip gpt
            return {}

        prompt, text_format = build_classify_csv_prompt(
            categories=deduplicated_categories,
            descriptions=unclassified_descriptions
        )

        output = self.gpt_client.ask(
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
            text=text_format,
            reasoning={},
            tools=[],
            temperature=0,
            max_output_tokens=2048,
            top_p=1,
            store=True
        )

        json_output = json.loads(output)

        # includes cached items and newly classified items
        combined_items = self.postprocess_descriptions(json_output)

        # returns { [description_name]: category }
        return combined_items
    
