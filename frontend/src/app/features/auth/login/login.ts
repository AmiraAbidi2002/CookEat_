import { Component } from '@angular/core';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-login',
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
  standalone: true,
  imports: [FormsModule, NgIf, RouterLink]
})
export class LoginComponent {
  username    = '';
  password = '';
  showPass = false;
  errorMsg = '';
  loading  = false;

  constructor(private auth: AuthService, private router: Router, private route: ActivatedRoute) {}

  onLogin() {
    this.errorMsg = '';
    if (!this.username || !this.password) {
      this.errorMsg = 'Veuillez remplir tous les champs.';
      return;
    }
    this.loading = true;
     this.auth.login(this.username, this.password).subscribe({
      next: (res: any) => {
        this.loading = false;
        // Sauvegarder les infos user si renvoyées
        if (res.user) {
          localStorage.setItem('user', JSON.stringify(res.user));
        }
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || null;
        // Redirection selon le rôle
        if (this.auth.isAdmin()) {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigate(['/profile']);
        }
      },
      error: (err) => {
        this.loading = false;
        if (err.status === 401) {
          this.errorMsg = 'Invalid username or password.';
        } else {
          this.errorMsg = 'Login failed. Please try again.';
        }
      }
    });
  }
}