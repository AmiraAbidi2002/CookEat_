import {
  Component,
  OnInit,
  AfterViewInit,
  Inject,
  PLATFORM_ID,
  HostListener,
  ViewChild,
  ElementRef,
  ChangeDetectorRef
} from '@angular/core';
import {
  isPlatformBrowser,
  NgFor,
  NgIf,
  CommonModule
} from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { AuthService } from '../../core/services/auth';
import { Api } from '../../services/api';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  standalone: true,
  imports: [NgFor, NgIf, RouterLink, FormsModule, CommonModule]
})
export class HomeComponent implements OnInit, AfterViewInit {
  // ================= BACKEND MEALS =================
  meals: any[] = [];

  // ================= NAVBAR =================
  navScrolled = false;
  showGoToTop = false;

  // ================= SEARCH =================
  searchQuery = '';
  searchResults: any[] = [];
  searchDone = false;

  // ================= TESTIMONIALS =================
  testimonials = [
    {
      text: 'I made the ramen tonight… delicious!',
      name: 'Chazz',
      avatar: 'assets/avatars/chazz.jpg'
    },
    {
      text: "Hello, I tried the Ramen and Quinoa salad. It's very good.",
      name: 'Chaima',
      avatar: 'assets/avatars/chaima.jpg'
    },
    {
      text: 'Fast delivery and fresh ingredients.',
      name: 'Sarra',
      avatar: 'assets/avatars/sarra.jpg'
    },
    {
      text: 'Great concept for saving time during the week.',
      name: 'Youssef',
      avatar: 'assets/avatars/youssef.jpg'
    }
  ];

  currentIndex = 0;

  constructor(
    private api: Api,
    public auth: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef, 
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  // ================= INIT =================
  ngOnInit() {
    this.loadMeals();
  }

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      const elements = document.querySelectorAll('.fade-in');

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('show');
          }
        });
      }, { threshold: 0.1 });

      elements.forEach(el => observer.observe(el));
    }
  }

@ViewChild('slider', { static: false }) slider!: ElementRef;

scrollLeft() {
   if (!this.slider) return;
  this.slider.nativeElement.scrollBy({
    left: -300,
    behavior: 'smooth'
  });
}

scrollRight() {
   if (!this.slider) return;
  this.slider.nativeElement.scrollBy({
    left: 300,
    behavior: 'smooth'
  });
}

// afficher 6 meals
get displayedMeals(): any[] {
  return this.meals.slice(0, 6);
}

  // ================= LOAD MEALS =================
  loadMeals() {
    this.api.getMeals().subscribe({
      next: (data) => {
        this.meals = data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Meals error:', err)
    });
  }

  // ================= AUTH =================
  get isLoggedIn(): boolean {
    return this.auth.isLoggedIn();
  }

  get currentUser(): any {
    return this.auth.getCurrentUser();
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/']);
  }

  // ================= NAVIGATION =================
  navigateToMeal(id: number) {
    this.router.navigate(['/meal', id]);
  }

  goToProfile() {
    this.router.navigate(['/profile']);
  }

  goToCart() {
    this.router.navigate(['/cart']);
  }

  goToOrders() {
    this.router.navigate(['/orders']);
  }

  // ================= DISPLAY =================



// ================= SEARCH =================
onSearch() {
  this.searchDone = true;
  if (!this.searchQuery.trim()) {
    this.searchResults = [];
    return;
  }

  this.api.searchMeals(this.searchQuery).subscribe({
    next: (data) => {
      this.searchResults = data;
      this.cdr.detectChanges();
    },
    error: (err) => {
      console.error('Search error:', err);
      this.searchResults = [];
    }
  });
}

  // ================= TESTIMONIALS =================
  next() {
    this.currentIndex =
      (this.currentIndex + 1) % this.testimonials.length;
  }

  prev() {
    this.currentIndex =
      (this.currentIndex - 1 + this.testimonials.length) %
      this.testimonials.length;
  }

  // ================= SCROLL =================
  @HostListener('window:scroll')
  onWindowScroll() {
    if (isPlatformBrowser(this.platformId)) {
      this.showGoToTop = window.scrollY > 500;
      this.navScrolled = window.scrollY > 50;
    }
  }

  scrollToTop() {
    if (isPlatformBrowser(this.platformId)) {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  }
}