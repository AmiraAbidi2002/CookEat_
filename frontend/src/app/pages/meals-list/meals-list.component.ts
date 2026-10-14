import {
  Component,
  OnInit,
  HostListener,
  Inject
} from '@angular/core';

import {
  CommonModule,
  isPlatformBrowser
} from '@angular/common';

import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { PLATFORM_ID } from '@angular/core';

import { Api } from '../../services/api';

@Component({
  selector: 'app-meals-list',
  templateUrl: './meals-list.component.html',
  styleUrls: ['./meals-list.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule]
})
export class MealsListComponent implements OnInit {

  meals: any[] = [];
  filteredMeals: any[] = [];
  searchQuery = '';
  isLoading = true;
  navScrolled = false;
  showGoToTop = false;
  isLoggedIn = false;

  constructor(
    private api: Api,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    this.loadMeals();

    if (isPlatformBrowser(this.platformId)) {
      this.isLoggedIn = !!localStorage.getItem('token');
    }
  }

  loadMeals(): void {
    this.api.getMeals().subscribe({
      next: (data: any[]) => {
        this.meals = data;
        this.filteredMeals = data;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  onSearch(): void {
    if (!this.searchQuery.trim()) {
      this.filteredMeals = this.meals;
      return;
    }

    this.filteredMeals = this.meals.filter(meal =>
      meal.title.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }

  navigateToMeal(id: number): void {
    this.router.navigate(['/meal', id]);
  }

  @HostListener('window:scroll')
  onWindowScroll(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const scrollY = window.scrollY;
    this.navScrolled = scrollY > 50;
    this.showGoToTop = scrollY > 300;
  }

  scrollToTop(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}