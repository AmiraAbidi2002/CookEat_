import requests
from django.core.management.base import BaseCommand
from meals.models import Meal, Category
from decimal import Decimal
import random
import re


class Command(BaseCommand):
    help = "Import meals from TheMealDB"

    def handle(self, *args, **kwargs):

        url = "https://www.themealdb.com/api/json/v1/1/search.php?s="
        response = requests.get(url)
        data = response.json()

        if not data["meals"]:
            self.stdout.write(self.style.ERROR("No meals found"))
            return

        for item in data["meals"]:

            # -------------------------
            # CATEGORY
            # -------------------------
            category_name = item["strCategory"]

            category_obj, created = Category.objects.get_or_create(
                name=category_name
            )

            # -------------------------
            # TITLE
            # -------------------------
            title = item["strMeal"]

            # -------------------------
            # INSTRUCTIONS
            # -------------------------
            instructions = item["strInstructions"]

            # Nettoyer les retours à la ligne
            instructions = instructions.replace("\r", " ").replace("\n", " ")

            # Séparer en phrases
            sentences = re.split(r"\.\s+", instructions)

            steps = ""

            for sentence in sentences:

                sentence = sentence.strip()

                if sentence:

                    # enlever STEP ou chiffres inutiles
                    sentence = re.sub(r"STEP\s*\d+", "", sentence, flags=re.IGNORECASE)
                    sentence = re.sub(r"^\d+\s*", "", sentence)

                    steps += f"- {sentence}.\n"

            # -------------------------
            # INGREDIENTS
            # -------------------------
            ingredients = []

            for i in range(1, 21):

                ingredient = item.get(f"strIngredient{i}")
                measure = item.get(f"strMeasure{i}")

                if ingredient and ingredient.strip():

                    ingredient = ingredient.strip()
                    measure = measure.strip() if measure else ""

                    if measure:
                        ingredients.append(f"- {ingredient} ({measure})")
                    else:
                        ingredients.append(f"- {ingredient}")

            ingredients_text = "\n".join(ingredients)

            # -------------------------
            # VIDEO
            # -------------------------
            youtube = item["strYoutube"]

            # -------------------------
            # IMAGE
            # -------------------------
            image = item["strMealThumb"]

            # -------------------------
            # RANDOM PRICE
            # -------------------------
            price = Decimal(random.randint(8, 25))

            # -------------------------
            # DESCRIPTION FINAL
            # -------------------------
            description = f"""Recipe

Steps:
{steps}

Ingredients:
{ingredients_text}

Video:
{youtube}
"""

            # -------------------------
            # CREATE MEAL
            # -------------------------
            Meal.objects.update_or_create(
                title=title,
                defaults={
                    "description": description,
                    "price": price,
                    "image": image,
                    "category": category_obj,
                },
            )

        self.stdout.write(self.style.SUCCESS("Meals imported successfully"))