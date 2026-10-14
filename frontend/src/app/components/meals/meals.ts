import { Component, OnInit } from '@angular/core';
import {  MealService } from '../../services/meal' ;
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-meals',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './meals.html',
  styleUrl: './meals.css',
})
export class Meals implements OnInit {
  meals: any[] = [];

  constructor(private mealService: MealService) {}
  ngOnInit(): void {
    this.mealService.getMeals().subscribe((data) => {
      this.meals = data;
    });
  }

}
