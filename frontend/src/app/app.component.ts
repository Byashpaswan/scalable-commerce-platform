import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from './core/services/auth.service';
import { CartService } from './core/services/cart.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="navbar">
      <div class="container">
        <a routerLink="/" class="logo">🚀 Antigravity Shop</a>
        <nav>
          <a routerLink="/products" routerLinkActive="active">Catalog</a>
          <a routerLink="/cart" routerLinkActive="active" class="cart-link">
            Cart <span class="badge" *ngIf="cartCount() > 0">{{ cartCount() }}</span>
          </a>
          
          <ng-container *ngIf="isAuthenticated(); else loginBtn">
            <span class="user-welcome">Hi, {{ currentUser()?.firstName }}</span>
            <a (click)="logout()" class="logout-btn">Logout</a>
          </ng-container>
          <ng-template #loginBtn>
            <a routerLink="/login" class="login-btn">Login</a>
          </ng-template>
        </nav>
      </div>
    </header>

    <main class="main-content">
      <router-outlet></router-outlet>
    </main>

    <footer class="footer">
      <div class="container">
        <p>&copy; 2026 Antigravity Multi-Vendor Platform. Built with Angular Standalone & Signals.</p>
      </div>
    </footer>
  `,
  styles: [`
    .navbar {
      background: rgba(18, 20, 26, 0.85);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      position: sticky;
      top: 0;
      z-index: 100;
      padding: 1rem 0;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 1.5rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .logo {
      font-size: 1.5rem;
      font-weight: 700;
      color: #fff;
      text-decoration: none;
      background: linear-gradient(135deg, #00f2fe 0%, #4facfe 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    nav {
      display: flex;
      align-items: center;
      gap: 1.5rem;
    }
    nav a {
      color: #b5b7c0;
      text-decoration: none;
      font-weight: 500;
      cursor: pointer;
      transition: color 0.2s;
    }
    nav a:hover, nav a.active {
      color: #fff;
    }
    .cart-link {
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }
    .badge {
      background: #ff4757;
      color: #fff;
      font-size: 0.75rem;
      padding: 0.15rem 0.4rem;
      border-radius: 99px;
      font-weight: 700;
    }
    .user-welcome {
      color: #929aab;
      font-size: 0.9rem;
    }
    .login-btn {
      background: #4facfe;
      color: #fff !important;
      padding: 0.5rem 1.2rem;
      border-radius: 8px;
    }
    .logout-btn {
      color: #ff4757 !important;
    }
    .main-content {
      min-height: calc(100vh - 160px);
      max-width: 1200px;
      margin: 2rem auto;
      padding: 0 1.5rem;
    }
    .footer {
      border-top: 1px solid rgba(255, 255, 255, 0.05);
      background: #090a0d;
      color: #686b75;
      padding: 1.5rem 0;
      text-align: center;
      font-size: 0.85rem;
    }
  `]
})
export class AppComponent {
  private authService = inject(AuthService);
  private cartService = inject(CartService);

  isAuthenticated = this.authService.isAuthenticated;
  currentUser = this.authService.currentUser;
  cartCount = this.cartService.cartCount;

  logout() {
    this.authService.logout();
  }
}
