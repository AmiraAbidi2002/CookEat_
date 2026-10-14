import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { adminGuard, authGuard } from './core/guards/auth-guard';
import { Meals } from './components/meals/meals';

export const routes: Routes = [
  { path: '',        component: HomeComponent },
  { path: 'home',    redirectTo: '', pathMatch: 'full' },
  { path: 'login',    loadComponent: () => import('./features/auth/login/login').then(m => m.LoginComponent) },
  { path: 'register', loadComponent: () => import('./features/auth/register/register').then(m => m.RegisterComponent) },
  { path: 'admin',    loadComponent: () => import('./features/admin/dashboard/dashboard').then(m => m.DashboardComponent), canActivate: [adminGuard] },
  { path: 'profile',  loadComponent: () => import('./features/profile/profile').then(m => m.ProfileComponent), canActivate: [authGuard] },
  { path: 'cart',     loadComponent: () => import('./features/cart/cart').then(m => m.CartComponent), canActivate: [authGuard] },
  { path: 'orders',   loadComponent: () => import('./features/orders/orders').then(m => m.OrdersComponent), canActivate: [authGuard] },
  {
    path: 'meal/:id',
    loadComponent: () => import('./features/meal-detail/meal-detail')
      .then(m => m.MealDetailComponent)
  },
  { path: 'meals', loadComponent: () =>
    import('./pages/meals-list/meals-list.component')
      .then(m => m.MealsListComponent) },

     { path: 'payment', loadComponent: () => import('./features/payment/payment').then(m => m.PaymentComponent), canActivate: [authGuard] },
];