import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Stats {
  total_revenue: number;
  revenue_today: number;
  total_orders: number;
  total_meals: number;
  total_categories: number;
  revenue_by_day: { day: string; revenue: number }[];
  orders_by_status: { status: string; count: number }[];
  top_meals: { name: string; quantity: number }[];
}

@Injectable({ providedIn: 'root' })
export class StatsService {
  private apiUrl = 'http://localhost:8000/api/stats/';
  constructor(private http: HttpClient) {}
  getStats(): Observable<Stats> {
    return this.http.get<Stats>(this.apiUrl);
  }
}