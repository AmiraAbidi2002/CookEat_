import { Component, OnInit, HostListener } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth';
import { Api } from '../../services/api';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.html',
  styleUrls: ['./profile.css'],
  standalone: true,
  imports: [NgFor, NgIf, FormsModule, RouterLink]
})
export class ProfileComponent implements OnInit {

  // ================= NAVBAR =================
  navScrolled = false;

  @HostListener('window:scroll')
  onScroll() {
    this.navScrolled = window.scrollY > 50;
  }

  // ================= TABS =================
  activeTab = 'info';

  setTab(tab: string) {
    this.activeTab = tab;
  }

  // ================= USER =================
  userId = 0;
  name = '';
  email = '';
  phone = '';
  address = '';

  editingInfo = false;

  avatarUrl: string | null = null;

  get userInitial(): string {
    return this.name ? this.name.charAt(0).toUpperCase() : 'U';
  }

  onAvatarChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.avatarUrl = e.target.result;
      };
      reader.readAsDataURL(input.files[0]);
    }
  }

  // ================= PASSWORD =================
  currentPassword = '';
  newPassword = '';
  confirmPassword = '';

  showCurrentPass = false;
  showNewPass = false;

  passwordMsg = '';
  passwordError = false;

  // ================= DATA =================
  orders: any[] = [];
  favorites: any[] = [];
  activities: any[] = [];

  statusLabels: any = {
    delivered: 'Delivered',
    pending: 'Pending',
    preparing: 'Preparing',
    cancelled: 'Cancelled'
  };

  constructor(
  private auth: AuthService,
  private api: Api,
  private router: Router
) {}

  ngOnInit() {
    const user = this.auth.getCurrentUser();

    if (user) {
      this.userId = user.id;
      this.name = user.username;
      this.email = user.email || '';
      this.phone = user.phone || '';
      this.address = user.address || '';
    }

    this.loadOrders();
    this.loadFeaturedMeals();
  }
  loadFeaturedMeals() {
  this.api.getMeals().subscribe({
    next: (data: any[]) => {
      this.featuredMeals = data.slice(0, 4);
    },
    error: (err) => console.error(err)
  });
}

  // ================= PROFILE UPDATE =================
  saveInfo() {
    const data = {
      username: this.name,
      email: this.email,
      phone: this.phone,
      address: this.address
    };

    this.auth.updateUser(this.userId, data).subscribe({
      next: (res: any) => {
        this.auth.saveUser(res);
        this.editingInfo = false;
      },
      error: (err: any) => console.error(err)
    });
  }

  // ================= PASSWORD UPDATE =================
  savePassword() {
    if (this.newPassword !== this.confirmPassword) {
      this.passwordMsg = 'Passwords do not match';
      this.passwordError = true;
      return;
    }

    const data = {
      username: this.name,
      email: this.email,
      password: this.newPassword
    };

    this.auth.updateUser(this.userId, data).subscribe({
      next: () => {
        this.passwordMsg = 'Password updated successfully';
        this.passwordError = false;
        this.currentPassword = '';
        this.newPassword = '';
        this.confirmPassword = '';
      },
      error: () => {
        this.passwordMsg = 'Update failed';
        this.passwordError = true;
      }
    });
  }

  goToMeal(id: number) {
  this.router.navigate(['/meal', id]);
}

  // ================= ORDERS =================
  loadOrders() {
    this.auth.getOrders().subscribe({
      next: (data: any) => {
        this.orders = data;
      },
      error: (err: any) => console.error(err)
    });
  }

  get deliveredCount(): number {
    return this.orders.filter(o => o.status === 'delivered').length;
  }

  get totalSpent(): number {
    return this.orders
      .filter(o => o.status === 'delivered')
      .reduce((sum, o) => sum + Number(o.total_price || o.price || 0), 0);
  }

  // ================= FAVORITES =================
  removeFavorite(id: number) {
    this.favorites = this.favorites.filter(f => f.id !== id);
  }
  featuredMeals: any[] = [];

  // ================= LOGOUT =================
  logout() {
    this.auth.logout();
    this.router.navigate(['/login']); 
  }
}