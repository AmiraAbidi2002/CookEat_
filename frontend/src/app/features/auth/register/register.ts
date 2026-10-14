import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-register',
  templateUrl: './register.html',
  styleUrls: ['./register.css'],
  standalone: true,
  imports: [FormsModule, NgIf, RouterLink]
})
export class RegisterComponent {
  name     = '';
  email    = '';
  password = '';
  confirm  = '';
  showPass = false;
  errorMsg = '';
  loading  = false;

  constructor(private auth: AuthService, private router: Router) {}

  onRegister() {
    this.errorMsg = '';
    if (!this.name || !this.email || !this.password || !this.confirm) {
      this.errorMsg = 'Please fill in all fields.'; return;
    }
    if (this.password !== this.confirm) {
      this.errorMsg = 'Passwords do not match.'; return;
    }
    if (this.password.length < 6) {
      this.errorMsg = 'Password must be at least 6 characters.'; return;
    }
    this.loading = true;
    // Appel HTTP vers Django
    this.auth.register(this.name, this.email, this.password).subscribe({
      next: () => {
        // Inscription OK → aller à login
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.loading = false;
        console.log('REGISTER ERROR =>', err.error);
  this.errorMsg = JSON.stringify(err.error);
        if (err.error?.username) {
          this.errorMsg = 'Username already exists.';
        } else if (err.error?.email) {
          this.errorMsg = 'Email already used.';
        } else {
          this.errorMsg = 'Registration failed. Try again.';
        }
      }
    });
  }
}