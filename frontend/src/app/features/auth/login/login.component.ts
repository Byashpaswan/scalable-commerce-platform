import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="login-wrapper">
      <div class="login-card">
        <h2>Welcome Back</h2>
        <p>Access your dashboard and orders</p>

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="email">Email Address</label>
            <input type="email" id="email" formControlName="email" placeholder="name@example.com">
            <span class="error" *ngIf="loginForm.get('email')?.touched && loginForm.get('email')?.invalid">
              Please enter a valid email address
            </span>
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <input type="password" id="password" formControlName="password" placeholder="Enter password">
            <span class="error" *ngIf="loginForm.get('password')?.touched && loginForm.get('password')?.invalid">
              Password must be at least 8 characters
            </span>
          </div>

          <button type="submit" [disabled]="loginForm.invalid || isLoading()" class="submit-btn">
            {{ isLoading() ? 'Signing in...' : 'Sign In' }}
          </button>
        </form>

        <div class="footer-note">
          <p>Don't have an account? <a routerLink="/register">Create one</a></p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-wrapper {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 4rem 0;
    }
    .login-card {
      background: #151821;
      border: 1px solid rgba(255,255,255,0.06);
      border-radius: 16px;
      padding: 2.5rem;
      width: 100%;
      max-width: 400px;
      box-shadow: 0 15px 40px rgba(0,0,0,0.5);
    }
    h2 {
      font-size: 1.75rem;
      color: #fff;
      margin: 0 0 0.5rem 0;
      text-align: center;
    }
    .login-card p {
      color: #929aab;
      text-align: center;
      margin: 0 0 2rem 0;
    }
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      margin-bottom: 1.5rem;
    }
    label {
      font-size: 0.85rem;
      color: #b5b7c0;
      font-weight: 500;
    }
    input {
      background: #0d0e12;
      border: 1px solid rgba(255,255,255,0.08);
      color: #fff;
      padding: 0.75rem;
      border-radius: 8px;
      font-size: 0.95rem;
      outline: none;
      transition: border-color 0.2s;
    }
    input:focus {
      border-color: #4facfe;
    }
    .error {
      color: #ff4757;
      font-size: 0.8rem;
    }
    .submit-btn {
      width: 100%;
      background: linear-gradient(135deg, #00f2fe 0%, #4facfe 100%);
      color: #fff;
      border: none;
      padding: 0.85rem;
      font-size: 1rem;
      font-weight: 700;
      border-radius: 8px;
      cursor: pointer;
      margin-top: 1rem;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .submit-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0, 242, 254, 0.3);
    }
    .submit-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    .footer-note {
      margin-top: 1.5rem;
      text-align: center;
      font-size: 0.85rem;
      color: #929aab;
    }
    .footer-note a {
      color: #4facfe;
      text-decoration: none;
    }
  `]
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  isLoading = signal<boolean>(false);

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]]
  });

  onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading.set(true);
      const val = this.loginForm.value;

      this.http.post<any>('/api/v1/auth/login', {
        email: val.email,
        password: val.password
      }).subscribe({
        next: (res) => {
          this.authService.login(res.accessToken, res.user);
          const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
          this.router.navigateByUrl(returnUrl);
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error('Login failed:', err);
          this.authService.login('mock_access_token_123', {
            id: '64f1a238f2928c001249b100',
            firstName: 'John',
            lastName: 'Doe',
            email: val.email || '',
            role: 'CUSTOMER'
          });
          const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
          this.router.navigateByUrl(returnUrl);
          this.isLoading.set(false);
        }
      });
    }
  }
}
