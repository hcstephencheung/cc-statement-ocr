import json
from serializers.csv_serializers import ClassifiedCategoryDescriptions, ClassifiedDescriptionsCategories
from utils.logger import setup_logger
from gpt.prompts import build_classify_csv_prompt
from gpt.completions import Completions

logger = setup_logger()

class CsvProcessorPipeline:
    def __init__(self):
        self.gpt_client = Completions(model="gpt-4.1")
        self.descriptions_categories_cache = {}

    def preprocess_descriptions(self, requested_descriptions):
        """
        Check if categories requested are cached. return un-cached categories.
        """
        if not requested_descriptions:
            return []

        deduplicated_descriptions = list(set(requested_descriptions))
        uncached_descriptions = []
        for descriptions in deduplicated_descriptions:
            if descriptions not in self.descriptions_categories_cache:
                uncached_descriptions.append(descriptions)
        logger.info(f'Uncached descriptions: {uncached_descriptions}')
        return uncached_descriptions
    
    def postprocess_descriptions(self, classified_categories_descriptions: ClassifiedCategoryDescriptions):
        """
        Add newly processed categories to the cache.
        """
        for category, descriptions in classified_categories_descriptions.items():
            for description in descriptions:
                description_name = f'{description["name"]}' if description['name'] else None
               
                if description_name is not None:
                    if hasattr(self.descriptions_categories_cache, description_name):
                        if self.descriptions_categories_cache[description_name] != category:
                            logger.info(f'Warning: description {description_name} already exists in cache. Overwritten to {category}')

                # update the cache with new descriptions
                self.descriptions_categories_cache[description_name] = category

        logger.info(f'Updated descriptions cache: {self.descriptions_categories_cache}')
        return self.descriptions_categories_cache
    
    def classify_csv_items(self, categories: str, descriptions: str) -> ClassifiedDescriptionsCategories:
        """
        Classify descriptions into categories using GPT. Categories and descriptions will be
        de-duplicated before processing. Results will be cached on instance to reduce cost.
        """
        deduplicated_categories = list(set(categories))
        unclassified_descriptions = self.preprocess_descriptions(descriptions)

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