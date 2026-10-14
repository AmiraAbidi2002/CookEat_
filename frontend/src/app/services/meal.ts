import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Meal {
  id: number;
  title: string;
  description: string;
  price: number;
  image: string;
   image_url?: string;
  category: number;
}

@Injectable({
  providedIn: 'root'
})
export class MealService {

  private apiUrl = 'http://127.0.0.1:8000/api/meals/';

  constructor(private http: HttpClient) {}

  getMeals(): Observable<Meal[]> {
    return this.http.get<Meal[]>(this.apiUrl);
  }
}