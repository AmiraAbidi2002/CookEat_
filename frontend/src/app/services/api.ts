import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Api {

  private baseUrl = 'http://localhost:8000/api'; // adapte si besoin

  private categoriesUrl = 'http://localhost:8000/api/categories/';

  private mealsUrl = 'http://localhost:8000/api/meals/';

  constructor(private http: HttpClient) {}

 searchMeals(query: string): Observable<any[]> {
  return this.http.get<any[]>(`${this.baseUrl}/meals/?search=${encodeURIComponent(query)}`); // ✅
}

getCategories(): Observable<any[]> {
  return this.http.get<any[]>(`${this.baseUrl}/categories/`);  
}
  getMealById(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/meals/${id}/`);
  }

  getMeals(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/meals/`);
  }

  addToCart(mealId: number, quantity: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/cart-items/`, {
      meal_id: mealId,
    quantity: quantity
    });
  }
createMeal(data: FormData): Observable<any> {
  return this.http.post(this.mealsUrl, data);
}

updateMeal(id: number, data: FormData): Observable<any> {
  return this.http.put(`${this.mealsUrl}${id}/`, data);
}
getCategoryById(id: number): Observable<any> {
  return this.http.get(`${this.baseUrl}/categories/${id}/`);
}
deleteMeal(id: number): Observable<any> {
  return this.http.delete(`${this.mealsUrl}${id}/`);
}
  createCategory(data: any): Observable<any> {
  return this.http.post(this.categoriesUrl, data);
}

updateCategory(id: number, data: any): Observable<any> {
  return this.http.put(`${this.categoriesUrl}${id}/`, data);
}

deleteCategory(id: number): Observable<any> {
  return this.http.delete(`${this.categoriesUrl}${id}/`);
}
}