import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-checkout-cancel',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="cancel-card">
      <span class="material-icons warning-icon">cancel</span>
      <h2>Payment Cancelled</h2>
      <p>The transaction was cancelled or declined. If you ran into an issue, you can safely try paying again. No charges were made to your account.</p>
      
      <div class="order-info" *ngIf="orderId()">
        <strong>Order Reference:</strong> {{ orderId() }}
      </div>

      <div class="button-group">
        <button routerLink="/checkout" class="retry-btn">Retry Checkout</button>
        <button routerLink="/" class="home-btn">Return Home</button>
      </div>
    </div>
  `,
  styles: [`
    .cancel-card {
      max-width: 500px;
      margin: 4rem auto;
      background: #151821;
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 16px;
      padding: 3rem;
      text-align: center;
      box-shadow: 0 15px 40px rgba(0, 0, 0, 0.5);
    }
    .warning-icon {
      font-size: 5rem;
      color: #ff4757;
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
      line-height: 1.6;
      margin-bottom: 1.5rem;
    }
    .order-info {
      background: #0d0e12;
      padding: 0.75rem;
      border-radius: 8px;
      color: #fff;
      font-family: monospace;
      margin-bottom: 2rem;
    }
    .button-group {
      display: flex;
      gap: 1rem;
      justify-content: center;
    }
    .retry-btn {
      background: linear-gradient(135deg, #ff6b6b 0%, #ff4757 100%);
      color: #fff;
      border: none;
      padding: 0.8rem 1.5rem;
      font-size: 1rem;
      font-weight: 700;
      border-radius: 8px;
      cursor: pointer;
      flex: 1;
      transition: opacity 0.2s;
    }
    .retry-btn:hover {
      opacity: 0.9;
    }
    .home-btn {
      background: #232736;
      color: #b5b7c0;
      border: 1px solid rgba(255, 255, 255, 0.08);
      padding: 0.8rem 1.5rem;
      font-size: 1rem;
      font-weight: 700;
      border-radius: 8px;
      cursor: pointer;
      flex: 1;
      transition: background 0.2s;
    }
    .home-btn:hover {
      background: #2b3043;
      color: #fff;
    }
  `]
})
export class CheckoutCancelComponent implements OnInit {
  private route = inject(ActivatedRoute);
  orderId = signal<string | null>(null);

  ngOnInit() {
    this.orderId.set(this.route.snapshot.queryParams['orderId']);
  }
}
