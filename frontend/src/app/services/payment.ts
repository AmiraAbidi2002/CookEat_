import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {

  private apiUrl = 'http://localhost:8000/api/payment/pay/';

  constructor(private http: HttpClient) {}

  createPaymentIntent(orderId: number) {
    return this.http.post<any>(this.apiUrl, {
      order_id: orderId
    });
  }
}