from django.core.management.base import BaseCommand
from meals.models import Meal
import csv


class Command(BaseCommand):

    def handle(self, *args, **kwargs):

        with open("meals_dataset.csv", "w", newline="", encoding="utf-8") as file:

            writer = csv.writer(file)

            writer.writerow([
                "id",
                "title",
                "description",
                "price",
                "category"
            ])

            for meal in Meal.objects.all():

                writer.writerow([
                    meal.id,
                    meal.title,
                    meal.description,
                    meal.price,
                    meal.category.name if meal.category else ""
                ])

        self.stdout.write(self.style.SUCCESS("Dataset exported successfully"))