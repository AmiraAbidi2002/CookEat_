import { Component, Inject, PLATFORM_ID, HostListener } from '@angular/core';
import { isPlatformBrowser, NgFor, NgIf } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth';
import { OrderService } from '../../services/order';
import { Order } from '../../services/order';
import { CommonModule } from '@angular/common';

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}



@Component({
  selector: 'app-orders',
  templateUrl: './orders.html',
  styleUrls: ['./orders.css'],
  standalone: true,
  imports: [NgFor, NgIf, RouterLink,CommonModule]
})
export class OrdersComponent {

  constructor(
    private auth: AuthService,
    private router: Router,
    private orderService: OrderService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  // ===================== NAVBAR =====================
  navScrolled = false;

  @HostListener('window:scroll')
  onScroll() {
    if (isPlatformBrowser(this.platformId)) {
      this.navScrolled = window.scrollY > 50;
    }
  }

  logout() { this.auth.logout();
    this.router.navigate(['/login']); 
   }
get deliveredCount(): number { return this.orders.filter(o => o.status === 'delivered').length; }
get pendingCount():   number { return this.orders.filter(o => o.status === 'pending').length; }
get cancelledCount(): number { return this.orders.filter(o => o.status === 'cancelled').length; }

  // ===================== ORDERS =====================
  // Mock data — replace with API call later
  orders: Order[] = [];

  // ===================== FILTER =====================
  filterStatus = '';

  get filteredOrders(): Order[] {
    if (!this.filterStatus) return this.orders;
    return this.orders.filter(o => o.status === this.filterStatus);
  }

  // ===================== HELPERS =====================
  getOrderTotal(order: Order): number {
    return order.total_price ;
  }

  getOrderSubtotal(order: Order): number {
    return order.items.reduce((s, i) => s + i.meal.price * i.quantity, 0);
  }

  getOrderItemCount(order: Order): number {
    return order.items.reduce((s, i) => s + i.quantity, 0);
  }

  statusLabels: Record<string, string> = {
    delivered: 'Delivered',
    pending:   'Pending',
    preparing: 'Preparing',
    cancelled: 'Cancelled',
    paid:      'Paid'
  };

  statusIcons: Record<string, string> = {
    delivered: 'fa-circle-check',
    pending:   'fa-clock',
    preparing: 'fa-fire-burner',
    cancelled: 'fa-circle-xmark',
    paid:      'fa-credit-card'
  };

  // expanded order detail
  expandedOrderId: number | null = null;

  toggleOrder(id: number) {
    this.expandedOrderId = this.expandedOrderId === id ? null : id;
  }
   ngOnInit() {
    this.loadOrders();
  }
  // Ajouter avec les autres getters
get paidCount(): number { return this.orders.filter(o => o.status === 'paid').length; }

  loadOrders() {
    this.orderService.getOrders().subscribe({
      next: (data) => {
        this.orders = data;
      },
      error: (err) => {
        console.error(err);
      }
    });
  }
}