import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Api } from '../../services/api';

@Component({
  selector: 'app-meal-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './meal-detail.html',
  styleUrls: ['./meal-detail.css']
})
export class MealDetailComponent implements OnInit {

  meal: any = null;
  similarMeals: any[] = [];
  quantity = 1;
  addedToCart = false;

  // Sections parsées
  shortDescription = '';
  steps: string[] = [];
  ingredients: string[] = [];
  videoUrl: SafeResourceUrl | null = null;
  categoryName = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private api: Api,
    private cdr: ChangeDetectorRef,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = +params['id'];
      this.api.getMealById(id).subscribe({
        next: (data) => {
          this.meal = data;
          this.parseDescription(data.description || '');
          if (typeof data.category === 'number') {
  this.api.getCategoryById(data.category).subscribe({
    next: (cat: any) => {
      this.categoryName = cat.name;
      this.cdr.detectChanges();
    },
    error: () => { this.categoryName = ''; }
  });
} else {
  this.categoryName = data.category?.name || '';
}
          this.cdr.detectChanges();
          this.loadSimilarMeals(id);
        },
        error: (err) => {
          console.error(err);
          this.router.navigate(['/']);
        }
      });
    });
  }

  parseDescription(desc: string): void {
    // ── 1. Découpe en blocs séparés par lignes vides ou titres connus
    // Normalise les sauts de ligne
    const text = desc.replace(/\r\n/g, '\n');

    // ── 2. Short description = tout ce qui est AVANT "Steps:" ou "Recipe"
    const beforeSteps = text.split(/Steps\s*:/i)[0];
    this.shortDescription = beforeSteps
      .replace(/Recipe/gi, '')
      .trim();

    // ── 3. Steps : entre "Steps:" et "Ingredients:"
    const stepsMatch = text.match(/Steps\s*:([\s\S]*?)(?=\n\s*\nIngredients\s*:|\nIngredients\s*:)/i);
    if (stepsMatch) {
      this.steps = stepsMatch[1]
        .split('\n')
        .map(l => l.replace(/^-\s*/, '').trim())
        .filter(l => l.length > 0);
    }

    // ── 4. Ingredients : entre "Ingredients:" et "Video:"
    const ingMatch = text.match(/Ingredients\s*:([\s\S]*?)(?=\n\s*\nVideo\s*:|\nVideo\s*:)/i);
    if (ingMatch) {
      this.ingredients = ingMatch[1]
        .split('\n')
        .map(l => l.replace(/^-\s*/, '').trim())
        .filter(l => l.length > 0);
    }

    // ── 5. Video : URL après "Video:"
    const videoMatch = text.match(/Video\s*:\s*(https?:\/\/\S+)/i);
    if (videoMatch) {
      const raw = videoMatch[1].trim();
      // Convertit en embed YouTube
      const ytId = raw.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
      const embedUrl = ytId
        ? `https://www.youtube.com/embed/${ytId[1]}`
        : raw;
      this.videoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
    }
  }

  loadSimilarMeals(currentId: number) {
    this.api.getMeals().subscribe((data: any[]) => {
      this.similarMeals = data
        .filter(m => m.id !== currentId)
        .slice(0, 4);
      this.cdr.detectChanges();
    });
  }

  increment() { this.quantity++; }
  decrement() { if (this.quantity > 1) this.quantity--; }

  addToCart() {
    const token = localStorage.getItem('access');
    if (!token) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
      return;
    }
    this.api.addToCart(this.meal.id, this.quantity).subscribe({
      next: () => { this.addedToCart = true; this.cdr.detectChanges(); },
      error: (err) => {
        if (err.status === 401) {
          localStorage.removeItem('access');
          localStorage.removeItem('refresh');
          this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
        }
      }
    });
  }
}