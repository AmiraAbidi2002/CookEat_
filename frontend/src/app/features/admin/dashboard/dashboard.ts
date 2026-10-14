import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf , DecimalPipe} from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth';
import { Api } from '../../../services/api';
import { OrderService } from '../../../services/order';
import { StatsService, Stats } from '../../../services/stats';

interface Category {
  id: number;
  name: string;
  description?: string;
  mealsCount?: number;
}

interface Meal {
  id: number;
  title: string;
   description?: string;
  category: string;
  price: number;
  duration?: number;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  image?: string;
  image_url?: string;
  available?: boolean;
}

interface Order {
  id: number;
  client: string;
  meal: string;
  date: string;
  status: 'delivered' | 'pending' | 'preparing' | 'cancelled'| 'paid';
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
  standalone: true,
  imports: [NgFor, NgIf, FormsModule, DecimalPipe]
})
export class DashboardComponent implements OnInit {
  constructor(
    private auth: AuthService,
    private router: Router,
    private api: Api,
     private orderService: OrderService ,
     private statsService: StatsService
  ) {}

  activeSection = 'overview';
 
stats: Stats | null = null;
statsLoading = true;
selectedMealImage: File | null = null;
  

  meals: Meal[] = [];
  categories: Category[] = [];
  orders: Order[] = [];

  searchMeal = '';
  filterCategory = '';
  searchCategory = '';
  searchOrder = '';
  filterStatus = '';

  showCategoryForm = false;
  isEditingCategory = false;
  categoryForm: Partial<Category> = {};
  deleteCategoryId: number | null = null;

  showMealForm = false;
  isEditingMeal = false;
  mealForm: Partial<Meal> = {};
  deleteMealId: number | null = null;

  categoryOptions: string[] = [];
  difficultyOptions: ('Easy' | 'Medium' | 'Hard')[] = ['Easy', 'Medium', 'Hard'];

  statusLabels: Record<string, string> = {
    delivered: 'Delivered',
    pending: 'Pending',
    preparing: 'Preparing',
    cancelled: 'Cancelled',
     paid: 'Paid'
  };

  ngOnInit() {
    this.loadMeals();
     this.loadCategories();
     this.loadOrders(); 
     this.loadStats();
  }

loadStats() {
  this.statsLoading = true;
  this.statsService.getStats().subscribe({
    next: (data) => {
      this.stats = data;
      this.statsLoading = false;
      // Render seulement si on est déjà sur overview
      if (this.activeSection === 'overview') {
        setTimeout(() => this.renderCharts(), 100);
      }
    },
    error: (err) => {
      console.error('Stats error:', err);
      this.statsLoading = false;
    }
  });
}
renderCharts() {
  this.renderRevenueChart();
  this.renderStatusChart();
  this.renderTopMealsChart();
}

renderRevenueChart() {
  const canvas = document.getElementById('revenueChart') as HTMLCanvasElement;
  if (!canvas || !this.stats) return;

  // Détruire le chart existant si présent
  const existing = (window as any).__revenueChart;
  if (existing) existing.destroy();

  const ctx = canvas.getContext('2d')!;
  const data = this.stats.revenue_by_day.slice(-14); // 14 derniers jours

  (window as any).__revenueChart = new (window as any).Chart(ctx, {
    type: 'line',
    data: {
      labels: data.map(d => d.day),
      datasets: [{
        label: 'Revenus (DT)',
        data: data.map(d => d.revenue),
        borderColor: '#e67e22',
        backgroundColor: 'rgba(230,126,34,0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: '#e67e22'
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } },
        x: { grid: { display: false } }
      }
    }
  });
}
renderStatusChart() {
  const canvas = document.getElementById('statusChart') as HTMLCanvasElement;
  if (!canvas || !this.stats) return;

  const existing = (window as any).__statusChart;
  if (existing) existing.destroy();

  const ctx = canvas.getContext('2d')!;
  const statusColors: Record<string, string> = {
    delivered: '#27ae60',
    pending:   '#f39c12',
    preparing: '#3498db',
    cancelled: '#e74c3c',
    paid:      '#9b59b6'
  };

  (window as any).__statusChart = new (window as any).Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: this.stats.orders_by_status.map(s => s.status),
      datasets: [{
        data: this.stats.orders_by_status.map(s => s.count),
        backgroundColor: this.stats.orders_by_status.map(s => statusColors[s.status] || '#95a5a6'),
        borderWidth: 0,
        hoverOffset: 6
      }]
    },
    options: {
      responsive: true,
       maintainAspectRatio: true,
  aspectRatio: 1.2,
      cutout: '70%',
      plugins: {
        legend: { position: 'bottom', labels: { padding: 16, font: { size: 12 } } }
      }
    }
  });
}

renderTopMealsChart() {
  const canvas = document.getElementById('topMealsChart') as HTMLCanvasElement;
  if (!canvas || !this.stats) return;

  const existing = (window as any).__topMealsChart;
  if (existing) existing.destroy();

  const ctx = canvas.getContext('2d')!;

  (window as any).__topMealsChart = new (window as any).Chart(ctx, {
    type: 'bar',
    data: {
      labels: this.stats.top_meals.map(m => m.name),
      datasets: [{
        label: 'Quantité commandée',
        data: this.stats.top_meals.map(m => m.quantity),
        backgroundColor: [
          'rgba(230,126,34,0.8)',
          'rgba(52,152,219,0.8)',
          'rgba(39,174,96,0.8)',
          'rgba(155,89,182,0.8)',
          'rgba(231,76,60,0.8)'
        ],
        borderRadius: 6,
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      indexAxis: 'y',
      plugins: { legend: { display: false } },
      scales: {
        x: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } },
        y: { grid: { display: false } }
      }
    }
  });}
  loadOrders() {
  this.orderService.getAllOrders().subscribe({
      next: (data: any[]) => {
        this.orders = data.map(order => ({
          id: order.id,
          client: order.user?.username || order.user || 'Client',
          meal: order.items.map((i: any) => i.meal.title).join(', '),
          date: new Date(order.created_at).toLocaleDateString(),
          status: order.status
        }));
      },
      error: (err) => console.error('Orders error:', err)
    });
  }
/*loadCategories() {
  this.api.getCategories().subscribe({
    next: (data: any[]) => {
      this.categories = data.map(cat => ({
        ...cat,
        mealsCount: this.meals.filter(m => m.category === cat.name).length
      }));
    },
    error: err => console.error('Erreur categories:', err)
  });
}*/
 loadMeals() {
    this.api.getMeals().subscribe({
      next: (data: any[]) => {
        this.meals = data.map(meal => ({
          ...meal,
          image: meal.image_url,
          available: true,
          duration: 30,
          difficulty: 'Easy' as 'Easy'
        }));

        this.categoryOptions = [...new Set(this.meals.map(m => m.category))];

        // Load categories AFTER meals — compare by id since API returns category as number
        this.api.getCategories().subscribe({
          next: (cats: any[]) => {
            this.categories = cats.map(cat => ({
              ...cat,
              // compare cat.id (number) to meal.category (number from API)
              mealsCount: this.meals.filter(m => Number(m.category) === cat.id).length
            }));
          },
          error: err => console.error('Categories error:', err)
        });
      },
      error: err => console.error('Meals error:', err)
    });
  }

// Remove the standalone loadCategories() method entirely, or keep it empty
loadCategories() {}

  get filteredMeals(): Meal[] {
    return this.meals.filter(m => {
      const matchSearch = m.title.toLowerCase().includes(this.searchMeal.toLowerCase());
      const matchCat = this.filterCategory ? m.category === this.filterCategory : true;
      return matchSearch && matchCat;
    });
  }

 get filteredCategories(): Category[] {
    if (!this.searchCategory) return this.categories;
    return this.categories.filter(c =>
      c.name.toLowerCase().includes(this.searchCategory.toLowerCase())
    );
  }

 get filteredOrders(): Order[] {
  return this.orders.filter(o => {
    const matchSearch = this.searchOrder
      ? o.client.toLowerCase().includes(this.searchOrder.toLowerCase()) ||
        o.meal.toLowerCase().includes(this.searchOrder.toLowerCase())
      : true;
    const matchStatus = this.filterStatus ? o.status === this.filterStatus : true;
    return matchSearch && matchStatus;
  });
}

  get pendingCount(): number {
    return this.orders.filter(o => o.status === 'pending').length;
  }

  setSection(section: string) {
  this.activeSection = section;
  this.resetAllForms();
  if (section === 'overview' && this.stats) {
    setTimeout(() => this.renderCharts(), 100);
  }
}

  

 

  get currentUserName(): string {
    return this.auth.getCurrentUser()?.username || 'Admin';
  }

  get currentUserInitial(): string {
    return this.currentUserName.charAt(0).toUpperCase();
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/']);
  }

  openAddMeal() {
  this.isEditingMeal = false;
  this.mealForm = { title: '', price: 0, available: true };
  this.selectedMealImage = null;
  this.showMealForm = true;
}

  openEditMeal(meal: Meal) {
  this.isEditingMeal = true;
  this.mealForm = { ...meal };
  this.selectedMealImage = null;
  this.showMealForm = true;
}

onMealImageChange(event: Event) {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files[0]) {
    this.selectedMealImage = input.files[0];
    // Prévisualisation
    const reader = new FileReader();
    reader.onload = (e) => {
      this.mealForm.image_url = e.target?.result as string;
    };
    reader.readAsDataURL(input.files[0]);
  }
}

 saveMeal() {
  if (!this.mealForm.title?.trim() || !this.mealForm.price || !this.mealForm.category) {
    alert('Title, price and category are required.');
    return;
  }

  const formData = new FormData();
  formData.append('title', this.mealForm.title!);
  formData.append('description', (this.mealForm as any).description || '');
  formData.append('price', String(this.mealForm.price));
  formData.append('category', String(this.mealForm.category));
  if (this.selectedMealImage) {
    formData.append('image', this.selectedMealImage);
  }

  if (this.isEditingMeal && this.mealForm.id) {
    // PUT — modifier
    this.api.updateMeal(this.mealForm.id, formData).subscribe({
      next: (updated: any) => {
        const index = this.meals.findIndex(m => m.id === updated.id);
        if (index !== -1) {
          this.meals[index] = {
            ...updated,
            image_url: updated.image_url,
            available: this.meals[index].available,
            duration: this.meals[index].duration,
            difficulty: this.meals[index].difficulty
          };
          this.meals = [...this.meals];
        }
        this.resetAllForms();
      },
      error: err => console.error('Update meal error:', err)
    });
  } else {
    // POST — créer
    this.api.createMeal(formData).subscribe({
      next: (created: any) => {
        this.meals = [...this.meals, {
          ...created,
          available: true,
          duration: 30,
          difficulty: 'Easy' as 'Easy'
        }];
        this.resetAllForms();
      },
      error: err => console.error('Create meal error:', err)
    });
  }
}

confirmDeleteMeal(id: number) {
  this.deleteMealId = id;
}

deleteMeal() {
  if (this.deleteMealId === null) return;
  this.api.deleteMeal(this.deleteMealId).subscribe({
    next: () => {
      this.meals = this.meals.filter(m => m.id !== this.deleteMealId);
      this.deleteMealId = null;
    },
    error: err => console.error('Delete meal error:', err)
  });
}
  toggleAvailability(meal: Meal) {
    meal.available = !meal.available;
  }

  

  

 openAddCategory() {
  this.isEditingCategory = false;
  this.categoryForm = { name: '', description: '' };  // ✅ reset le form
  this.showCategoryForm = true;
}

  openEditCategory(cat: Category) {
  this.isEditingCategory = true;                       // ✅ mode edit
  this.categoryForm = { ...cat };
  this.showCategoryForm = true;
}

  saveCategory() {
  if (!this.categoryForm.name?.trim()) return;         // ✅ validation

  if (this.isEditingCategory && this.categoryForm.id) {
    // ✅ PUT — modifier
    this.api.updateCategory(this.categoryForm.id, this.categoryForm).subscribe({
      next: (updated: any) => {
        const index = this.categories.findIndex(c => c.id === updated.id);
        if (index !== -1) {
          this.categories[index] = {
            ...updated,
            mealsCount: this.categories[index].mealsCount
          };
          this.categories = [...this.categories]; // force refresh
        }
        this.resetAllForms();
      },
      error: err => console.error('Update category error:', err)
    });
  } else {
    // ✅ POST — créer
    this.api.createCategory(this.categoryForm).subscribe({
      next: (created: any) => {
        this.categories = [...this.categories, { ...created, mealsCount: 0 }];
        this.resetAllForms();
      },
      error: err => console.error('Create category error:', err)
    });
  }
}

  confirmDeleteCategory(id: number) {
    this.deleteCategoryId = id;
  }

  deleteCategory() {
  if (this.deleteCategoryId === null) return;
  // ✅ DELETE — appel API
  this.api.deleteCategory(this.deleteCategoryId).subscribe({
    next: () => {
      this.categories = this.categories.filter(c => c.id !== this.deleteCategoryId);
      this.deleteCategoryId = null;
    },
    error: err => console.error('Delete category error:', err)
  });
}

 updateStatus(order: Order, status: Order['status']) {
  this.orderService.updateOrderStatus(order.id, status).subscribe({
    next: () => {
      order.status = status;
    },
    error: (err) => {
      console.error('Erreur update:', err);
    }
  });
}

  resetAllForms() {
    this.showCategoryForm = false;
    this.isEditingCategory = false;
    this.categoryForm = {};
    this.deleteCategoryId = null;

    this.showMealForm = false;
    this.isEditingMeal = false;
    this.mealForm = {};
    this.deleteMealId = null;
  }
}