import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

const API = 'http://localhost:8000/api';

@Injectable({ providedIn: 'root' })
export class AuthService {

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  // ================= REGISTER =================
  register(name: string, email: string, password: string): Observable<any> {
    return this.http.post(`${API}/register/`, {
      username: name,
      email,
      password,
      password2: password
    });
  }

  // ================= LOGIN =================
  login(username: string, password: string): Observable<any> {
    return this.http.post(`${API}/login/`, { username, password }).pipe(
      tap((res: any) => {
        if (isPlatformBrowser(this.platformId)) {
          localStorage.setItem('access_token', res.access);
          localStorage.setItem('refresh_token', res.refresh);

          const payload = this.decodeToken(res.access);

          localStorage.setItem('user', JSON.stringify({
            id: payload.user_id,
            username: payload.username || username,
            role: payload.is_staff ? 'admin' : 'user'
          }));
        }
      })
    );
  }

  // ================= LOGOUT =================
  logout() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
    }
  }

  // ================= TOKEN =================
  getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('access_token');
    }
    return null;
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  // ================= USER =================
  getCurrentUser(): any {
    if (isPlatformBrowser(this.platformId)) {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    }
    return null;
  }

  saveUser(user: any) {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('user', JSON.stringify(user));
    }
  }
  updateUser(id: number, data: any) {
  return this.http.put(`${API}/users/${id}/`, data);
}



getOrders() {
  return this.http.get(`${API}/orders/`);
}

  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'admin';
  }

  // ================= DECODE TOKEN =================
  private decodeToken(token: string): any {
    try {
      const payload = token.split('.')[1];
      const decoded = atob(payload);
      return JSON.parse(decoded);
    } catch {
      return null;
    }
  }
}