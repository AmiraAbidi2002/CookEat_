import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Order {
  id: number;
  created_at: string;
  status: string;
  total_price: number;
  items: {
    meal: {
      name: string;
      price: number;
    };
    quantity: number;
  }[];
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  private apiUrl = 'http://localhost:8000/api/orders/';

  constructor(private http: HttpClient) {}

  getOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(this.apiUrl);
  }

 createOrderFromCart(deliveryFee: number = 7): Observable<any> {
  return this.http.post(this.apiUrl + 'create_from_cart/', { delivery_fee: deliveryFee });
}

 getAllOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}?all=true`);
  }
 updateOrderStatus(orderId: number, status: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}${orderId}/`, { status });
  }
}