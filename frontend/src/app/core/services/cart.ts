import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { Observable } from 'rxjs';

const API = 'http://localhost:8000/api';

@Injectable({ providedIn: 'root' })
export class CartService {

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  private getHeaders() {
    let token = '';

    if (isPlatformBrowser(this.platformId)) {
      token = localStorage.getItem('access_token') || '';
    }

    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`
      })
    };
  }

  // ================= GET USER CART =================
  getCartItems(): Observable<any[]> {
    return this.http.get<any[]>(`${API}/cart-items/`, this.getHeaders());
  }

  // ================= UPDATE QUANTITY =================
  updateQuantity(id: number, quantity: number): Observable<any> {
    return this.http.patch(
      `${API}/cart-items/${id}/`,
      { quantity },
      this.getHeaders()
    );
  }

  // ================= REMOVE ITEM =================
  removeItem(id: number): Observable<any> {
    return this.http.delete(
      `${API}/cart-items/${id}/`,
      this.getHeaders()
    );
  }

  // ================= CLEAR CART =================
  clearCart(items: any[]): Observable<any>[] {
    return items.map(item => this.removeItem(item.id));
  }

  // ================= CHECKOUT =================
  checkout(): Observable<any> {
    return this.http.post(
      `${API}/orders/create_from_cart/`,
      {},
      this.getHeaders()
    );
  }
}