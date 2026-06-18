import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-mock-stripe-payment',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  template: `
    <div class="stripe-checkout-layout">
      <!-- Left side: Order Info -->
      <div class="order-summary-pane">
        <a (click)="onCancel()" class="back-link">
          <span class="material-icons">arrow_back</span> Back to Antigravity Shop
        </a>
        <div class="merchant-info">
          <div class="merchant-logo">AS</div>
          <span class="merchant-name">Antigravity Shop</span>
        </div>
        <div class="amount-display">
          <span class="amount-currency">USD</span>
          <span class="amount-val">\${{ amount() | number:'1.2-2' }}</span>
        </div>
        <div class="order-details-card">
          <div class="detail-row">
            <span class="detail-lbl">Order Reference</span>
            <span class="detail-val">{{ orderId() }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-lbl">Checkout Session</span>
            <span class="detail-val font-mono">{{ sessionId() }}</span>
          </div>
          <div class="detail-row" *ngIf="email()">
            <span class="detail-lbl">Email Address</span>
            <span class="detail-val">{{ email() }}</span>
          </div>
        </div>
        <div class="stripe-badge-wrapper">
          <span class="stripe-badge">SIMULATOR</span>
          <p class="stripe-badge-desc">You are using the simulated Stripe Payment Sandbox. Real card charges will not occur.</p>
        </div>
      </div>

      <!-- Right side: Payment form -->
      <div class="payment-form-pane">
        <div class="stripe-card-header">
          <h3>Pay with card</h3>
        </div>
        
        <form [formGroup]="cardForm" (ngSubmit)="onPay()">
          <div class="form-group">
            <label for="email">Email</label>
            <input type="email" id="email" formControlName="email" placeholder="you@example.com">
          </div>

          <div class="card-input-container">
            <label>Card Information</label>
            <div class="card-number-wrapper">
              <input type="text" formControlName="cardNumber" class="card-number-input" placeholder="4242  4242  4242  4242" maxlength="19">
              <span class="material-icons card-icon">credit_card</span>
            </div>
            <div class="card-expiry-cvc-row">
              <input type="text" formControlName="cardExpiry" class="expiry-input" placeholder="MM / YY" maxlength="5">
              <input type="text" formControlName="cardCvc" class="cvc-input" placeholder="CVC" maxlength="3">
            </div>
          </div>

          <div class="form-group">
            <label for="name">Name on card</label>
            <input type="text" id="name" formControlName="cardName" placeholder="Jane Doe">
          </div>

          <div class="form-group">
            <label for="country">Country or region</label>
            <select id="country" formControlName="country">
              <option value="US">United States</option>
              <option value="CA">Canada</option>
              <option value="GB">United Kingdom</option>
              <option value="IN">India</option>
            </select>
          </div>

          <button type="submit" [disabled]="cardForm.invalid || isProcessing()" class="pay-submit-btn">
            {{ isProcessing() ? 'Processing simulated webhook...' : 'Pay $' + (amount() | number:'1.2-2') }}
          </button>
        </form>

        <div class="stripe-footer">
          <span>Powered by <strong>stripe</strong></span>
          <span class="dot">•</span>
          <a (click)="onCancel()" class="cancel-link">Cancel and return</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .stripe-checkout-layout {
      display: flex;
      min-height: 80vh;
      max-width: 1000px;
      margin: 2rem auto;
      background: #ffffff;
      color: #30313d;
      border-radius: 12px;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.4);
      overflow: hidden;
    }
    @media (max-width: 768px) {
      .stripe-checkout-layout {
        flex-direction: column;
        min-height: auto;
      }
    }
    .order-summary-pane {
      flex: 1.1;
      background: #f8f9fa;
      padding: 3rem;
      border-right: 1px solid #e3e8ee;
      display: flex;
      flex-direction: column;
    }
    .payment-form-pane {
      flex: 1.2;
      padding: 3rem;
      background: #ffffff;
    }
    .back-link {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #6a737d;
      font-size: 0.9rem;
      text-decoration: none;
      cursor: pointer;
      margin-bottom: 2.5rem;
    }
    .back-link:hover {
      color: #30313d;
    }
    .merchant-info {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 1rem;
    }
    .merchant-logo {
      background: #635bff;
      color: #ffffff;
      font-weight: 800;
      width: 36px;
      height: 36px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.9rem;
    }
    .merchant-name {
      font-weight: 600;
      font-size: 1.1rem;
      color: #4f5b66;
    }
    .amount-display {
      margin-bottom: 2rem;
    }
    .amount-currency {
      color: #a3acb9;
      font-size: 1.3rem;
      font-weight: 500;
      margin-right: 0.5rem;
    }
    .amount-val {
      font-size: 2.5rem;
      font-weight: 700;
      color: #1a1f36;
    }
    .order-details-card {
      background: #ffffff;
      border: 1px solid #e3e8ee;
      border-radius: 8px;
      padding: 1.25rem;
      margin-bottom: 2rem;
    }
    .detail-row {
      display: flex;
      justify-content: space-between;
      padding: 0.5rem 0;
      font-size: 0.85rem;
    }
    .detail-row:not(:last-child) {
      border-bottom: 1px solid #f8f9fa;
    }
    .detail-lbl {
      color: #697386;
    }
    .detail-val {
      font-weight: 600;
      color: #1a1f36;
    }
    .font-mono {
      font-family: monospace;
      font-size: 0.8rem;
    }
    .stripe-badge-wrapper {
      margin-top: auto;
      background: #eaf1ff;
      border-radius: 8px;
      padding: 1rem;
      border: 1px solid #b3d1ff;
    }
    .stripe-badge {
      background: #635bff;
      color: white;
      font-size: 0.7rem;
      font-weight: 800;
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
      letter-spacing: 0.05em;
    }
    .stripe-badge-desc {
      font-size: 0.8rem;
      color: #3a4b61;
      margin-top: 0.5rem;
      margin-bottom: 0;
      line-height: 1.4;
    }
    .stripe-card-header h3 {
      font-size: 1.25rem;
      font-weight: 600;
      color: #1a1f36;
      margin-top: 0;
      margin-bottom: 2rem;
    }
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
      margin-bottom: 1.5rem;
    }
    .form-group label, .card-input-container label {
      font-size: 0.85rem;
      font-weight: 500;
      color: #4f5b66;
    }
    .form-group input, .form-group select {
      border: 1px solid #cfd7df;
      padding: 0.75rem;
      border-radius: 6px;
      font-size: 0.95rem;
      color: #1a1f36;
      outline: none;
      transition: border-color 0.15s ease;
      background: #ffffff;
    }
    .form-group input:focus, .form-group select:focus {
      border-color: #635bff;
      box-shadow: 0 0 0 2px rgba(99, 91, 255, 0.15);
    }
    .card-input-container {
      margin-bottom: 1.5rem;
    }
    .card-number-wrapper {
      position: relative;
    }
    .card-number-input {
      width: 100%;
      border: 1px solid #cfd7df;
      border-bottom: none;
      padding: 0.75rem;
      padding-right: 2.5rem;
      border-top-left-radius: 6px;
      border-top-right-radius: 6px;
      font-size: 0.95rem;
      color: #1a1f36;
      outline: none;
      box-sizing: border-box;
    }
    .card-number-input:focus {
      border-color: #635bff;
      z-index: 10;
    }
    .card-icon {
      position: absolute;
      right: 0.75rem;
      top: 50%;
      transform: translateY(-50%);
      color: #a3acb9;
    }
    .card-expiry-cvc-row {
      display: flex;
    }
    .expiry-input, .cvc-input {
      width: 50%;
      border: 1px solid #cfd7df;
      padding: 0.75rem;
      font-size: 0.95rem;
      color: #1a1f36;
      outline: none;
    }
    .expiry-input {
      border-bottom-left-radius: 6px;
      border-right: none;
    }
    .cvc-input {
      border-bottom-right-radius: 6px;
    }
    .expiry-input:focus, .cvc-input:focus {
      border-color: #635bff;
      z-index: 10;
    }
    .pay-submit-btn {
      width: 100%;
      background: #635bff;
      color: #ffffff;
      border: none;
      padding: 0.9rem;
      border-radius: 6px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      margin-top: 1.5rem;
      transition: background 0.15s ease;
      box-shadow: 0 4px 12px rgba(99, 91, 255, 0.25);
    }
    .pay-submit-btn:hover {
      background: #4b44e0;
    }
    .pay-submit-btn:disabled {
      background: #a3acb9;
      box-shadow: none;
      cursor: not-allowed;
    }
    .stripe-footer {
      margin-top: 2.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.8rem;
      color: #697386;
    }
    .stripe-footer strong {
      color: #1a1f36;
    }
    .dot {
      margin: 0 0.5rem;
      color: #cfd7df;
    }
    .cancel-link {
      color: #635bff;
      text-decoration: none;
      cursor: pointer;
    }
    .cancel-link:hover {
      text-decoration: underline;
    }
  `]
})
export class MockStripePaymentComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private http = inject(HttpClient);
  private fb = inject(FormBuilder);

  orderId = signal<string>('');
  sessionId = signal<string>('');
  amount = signal<number>(0);
  email = signal<string>('');
  userId = signal<string>('');
  isProcessing = signal<boolean>(false);

  cardForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    cardNumber: ['4242 4242 4242 4242', Validators.required],
    cardExpiry: ['12/29', Validators.required],
    cardCvc: ['123', Validators.required],
    cardName: ['', Validators.required],
    country: ['US', Validators.required]
  });

  ngOnInit() {
    const params = this.route.snapshot.queryParams;
    this.orderId.set(params['orderId'] || '');
    this.sessionId.set(params['sessionId'] || '');
    this.amount.set(parseFloat(params['amount'] || '0'));
    this.email.set(params['email'] || '');
    this.userId.set(params['userId'] || '');

    if (this.email()) {
      this.cardForm.patchValue({
        email: this.email()
      });
    }
  }

  onPay() {
    if (this.cardForm.valid) {
      this.isProcessing.set(true);

      const payload = {
        type: 'checkout.session.completed',
        data: {
          object: {
            id: this.sessionId(),
            amount_total: Math.round(this.amount() * 100),
            payment_intent: 'pi_mock_' + Math.random().toString(36).substring(2, 12),
            metadata: {
              orderId: this.orderId(),
              userId: this.userId(),
              email: this.cardForm.value.email || this.email()
            }
          }
        }
      };

      // Call the Stripe Webhook directly on the Payment Service
      this.http.post<any>('/api/v1/payments/webhook', payload).subscribe({
        next: () => {
          setTimeout(() => {
            this.isProcessing.set(false);
            this.router.navigate(['/checkout/success'], {
              queryParams: { orderId: this.orderId() }
            });
          }, 1500); // add short delay for visual realism
        },
        error: (err) => {
          console.error('Simulated webhook trigger failed:', err);
          alert('Error simulating payment completion. Check backend console.');
          this.isProcessing.set(false);
        }
      });
    }
  }

  onCancel() {
    this.router.navigate(['/checkout/cancel'], {
      queryParams: { orderId: this.orderId() }
    });
  }
}
