// REMPLACER tout le fichier par :
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CartService {

  private baseUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient) {}

  getCart(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/cart/`);
  }

  getCartItems(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/cart-items/`);
  }

  updateQuantity(itemId: number, quantity: number): Observable<any> {
    return this.http.patch(`${this.baseUrl}/cart-items/${itemId}/`, { quantity });
  }

  removeItem(itemId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/cart-items/${itemId}/`);
  }

  // checkout() ne crée plus l'order — juste navigate
  // On garde la méthode pour ne pas casser CartComponent
  checkout(): Observable<any[]> {
    return this.getCartItems(); // retourne les items, pas d'action backend
  }
}