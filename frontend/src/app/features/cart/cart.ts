import { Component, Inject, PLATFORM_ID, HostListener, OnInit } from '@angular/core';
import { isPlatformBrowser, NgFor, NgIf } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth';
import { CartService } from '../../core/services/cart';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.html',
  styleUrls: ['./cart.css'],
  standalone: true,
  imports: [NgFor, NgIf, RouterLink]
})
export class CartComponent implements OnInit {

  items: any[] = [];
  navScrolled = false;
  checkoutDone = false;

  constructor(
    private auth: AuthService,
    private cartService: CartService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    this.loadCart();
  }

  // ================= LOAD CART =================
  loadCart() {
    this.cartService.getCartItems().subscribe({
      next: (data) => {
        this.items = data;
      },
      error: (err) => console.error('Cart error:', err)
    });
  }

  // ================= NAVBAR =================
  @HostListener('window:scroll')
  onScroll() {
    if (isPlatformBrowser(this.platformId)) {
      this.navScrolled = window.scrollY > 50;
    }
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']); 
  }

  // ================= CALCULATIONS =================
  get subtotal(): number {
    return this.items.reduce((sum, item) => sum + item.meal.price * item.quantity, 0);
  }

  get deliveryFee(): number {
    return this.items.length > 0 ? 7 : 0;
  }

  get total(): number {
    return this.subtotal + this.deliveryFee;
  }

  get totalItems(): number {
    return this.items.reduce((sum, item) => sum + item.quantity, 0);
  }

  // ================= ACTIONS =================
  increment(item: any) {
    this.cartService.updateQuantity(item.id, item.quantity + 1).subscribe({
      next: () => this.loadCart()
    });
  }

  decrement(item: any) {
    if (item.quantity > 1) {
      this.cartService.updateQuantity(item.id, item.quantity - 1).subscribe({
        next: () => this.loadCart()
      });
    } else {
      this.removeItem(item.id);
    }
  }

  removeItem(id: number) {
    this.cartService.removeItem(id).subscribe({
      next: () => this.loadCart()
    });
  }

  clearCart() {
    this.items.forEach(item => {
      this.cartService.removeItem(item.id).subscribe();
    });
    this.items = [];
  }

  // ================= CHECKOUT =================
  checkout() {
  if (this.items.length === 0) return; 
      // Une seule navigation : vers la page de paiement
      this.router.navigate(['/payment']);
    
}
}