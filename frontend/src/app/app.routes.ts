import { Routes } from '@angular/router';
import { authGuard, roleGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'products', pathMatch: 'full' },
  { 
    path: 'products', 
    loadComponent: () => import('./features/catalog/product-list/product-list.component').then(m => m.ProductListComponent)
  },
  { 
    path: 'products/:id', 
    loadComponent: () => import('./features/catalog/product-detail/product-detail.component').then(m => m.ProductDetailComponent)
  },
  { 
    path: 'cart', 
    loadComponent: () => import('./features/cart/cart-view/cart-view.component').then(m => m.CartViewComponent)
  },
  { 
    path: 'login', 
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'checkout',
    loadComponent: () => import('./features/checkout/checkout-form/checkout-form.component').then(m => m.CheckoutFormComponent),
    canActivate: [authGuard]
  },
  {
    path: 'checkout/success',
    loadComponent: () => import('./features/checkout/checkout-success.component').then(m => m.CheckoutSuccessComponent),
    canActivate: [authGuard]
  },
  {
    path: 'checkout/cancel',
    loadComponent: () => import('./features/checkout/checkout-cancel.component').then(m => m.CheckoutCancelComponent),
    canActivate: [authGuard]
  },
  {
    path: 'checkout/mock-stripe-payment',
    loadComponent: () => import('./features/checkout/mock-stripe-payment.component').then(m => m.MockStripePaymentComponent),
    canActivate: [authGuard]
  },
  {
    path: 'seller',
    loadComponent: () => import('./features/seller-dashboard/seller-dashboard.component').then(m => m.SellerDashboardComponent),
    canActivate: [authGuard, roleGuard(['SELLER'])]
  },
  {
    path: 'admin',
    loadComponent: () => import('./features/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent),
    canActivate: [authGuard, roleGuard(['ADMIN', 'SUPER_ADMIN'])]
  }
];
