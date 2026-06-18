import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { CartService } from '../../core/services/cart.service';

@Component({
  selector: 'app-checkout-success',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="success-card">
      <span class="material-icons check-icon">check_circle</span>
      <h2>Payment Successful!</h2>
      <p>Thank you for your payment. Your transaction has been completed successfully.</p>
      <div class="order-info" *ngIf="orderId()">
        <strong>Order Reference:</strong> {{ orderId() }}
      </div>
      <p class="saga-note">Your order is being finalized asynchronously via distributed Saga queues.</p>
      <button routerLink="/" class="home-btn">Continue Shopping</button>
    </div>
  `,
  styles: [`
    .success-card {
      max-width: 500px;
      margin: 4rem auto;
      background: #151821;
      border: 1px solid rgba(255,255,255,0.06);
      border-radius: 16px;
      padding: 3rem;
      text-align: center;
      box-shadow: 0 15px 40px rgba(0,0,0,0.5);
    }
    .check-icon {
      font-size: 5rem;
      color: #2ed573;
      margin-bottom: 1.5rem;
    }
    h2 {
      color: #fff;
      font-size: 2rem;
      margin-top: 0;
      margin-bottom: 1rem;
    }
    p {
      color: #b5b7c0;
      line-height: 1.5;
      margin-bottom: 1.5rem;
    }
    .order-info {
      background: #0d0e12;
      padding: 0.75rem;
      border-radius: 8px;
      color: #fff;
      font-family: monospace;
      margin-bottom: 1.5rem;
    }
    .saga-note {
      font-size: 0.85rem;
      color: #929aab;
      font-style: italic;
    }
    .home-btn {
      background: linear-gradient(135deg, #00f2fe 0%, #4facfe 100%);
      color: #fff;
      border: none;
      padding: 0.8rem 2rem;
      font-size: 1rem;
      font-weight: 700;
      border-radius: 8px;
      cursor: pointer;
      margin-top: 1rem;
    }
  `]
})
export class CheckoutSuccessComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private cartService = inject(CartService);
  orderId = signal<string | null>(null);

  ngOnInit() {
    this.orderId.set(this.route.snapshot.queryParams['orderId']);
    this.cartService.clearCart();
  }
}
