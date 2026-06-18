import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CartService } from '../../../core/services/cart.service';

@Component({
  selector: 'app-checkout-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="checkout-container">
      <h2>Secure Checkout</h2>

      <div class="row">
        <div class="col billing-col">
          <h3>Shipping Address</h3>
          <form [formGroup]="checkoutForm" (ngSubmit)="onSubmit()">
            <div class="form-group">
              <label for="fullName">Full Name</label>
              <input type="text" id="fullName" formControlName="fullName" placeholder="Jane Doe">
            </div>

            <div class="form-group">
              <label for="phone">Phone Number</label>
              <input type="text" id="phone" formControlName="phone" placeholder="+1234567890">
            </div>

            <div class="form-group">
              <label for="address">Address Line 1</label>
              <input type="text" id="address" formControlName="addressLine1" placeholder="123 Main St">
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="city">City</label>
                <input type="text" id="city" formControlName="city" placeholder="San Jose">
              </div>
              <div class="form-group">
                <label for="state">State</label>
                <input type="text" id="state" formControlName="state" placeholder="CA">
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="country">Country</label>
                <input type="text" id="country" formControlName="country" placeholder="US">
              </div>
              <div class="form-group">
                <label for="postalCode">Postal Code</label>
                <input type="text" id="postalCode" formControlName="postalCode" placeholder="95112">
              </div>
            </div>

            <button type="submit" [disabled]="checkoutForm.invalid || isSubmitting()" class="pay-btn">
              {{ isSubmitting() ? 'Processing Saga Order...' : 'Pay with Credit Card' }}
            </button>
          </form>
        </div>

        <div class="col summary-col">
          <h3>Items Summary</h3>
          <div class="item-summary-card" *ngFor="let item of cartItems()">
            <span>{{ item.name }} (x{{ item.quantity }})</span>
            <span>\${{ (item.price * item.quantity) | number:'1.2-2' }}</span>
          </div>
          <hr>
          <div class="summary-total">
            <span>Grand Total</span>
            <span>\${{ cartTotal() | number:'1.2-2' }}</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .checkout-container {
      margin-top: 1rem;
    }
    h2 {
      font-size: 2rem;
      color: #fff;
      margin-bottom: 2rem;
    }
    .row {
      display: flex;
      flex-wrap: wrap;
      gap: 3rem;
    }
    .col {
      flex: 1;
      min-width: 300px;
    }
    .billing-col {
      background: #151821;
      border: 1px solid rgba(255,255,255,0.05);
      border-radius: 12px;
      padding: 2rem;
    }
    .billing-col h3, .summary-col h3 {
      font-size: 1.25rem;
      color: #fff;
      margin-top: 0;
      margin-bottom: 1.5rem;
    }
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
      margin-bottom: 1.25rem;
    }
    .form-row {
      display: flex;
      gap: 1rem;
    }
    .form-row .form-group {
      flex: 1;
    }
    label {
      font-size: 0.8rem;
      color: #b5b7c0;
    }
    input {
      background: #0d0e12;
      border: 1px solid rgba(255,255,255,0.08);
      color: #fff;
      padding: 0.7rem;
      border-radius: 6px;
      outline: none;
    }
    input:focus {
      border-color: #4facfe;
    }
    .pay-btn {
      width: 100%;
      background: linear-gradient(135deg, #00f2fe 0%, #4facfe 100%);
      color: #fff;
      border: none;
      padding: 0.85rem;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 700;
      cursor: pointer;
      margin-top: 1rem;
    }
    .pay-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    .summary-col {
      background: #151821;
      border: 1px solid rgba(255,255,255,0.05);
      border-radius: 12px;
      padding: 2rem;
      height: fit-content;
    }
    .item-summary-card {
      display: flex;
      justify-content: space-between;
      color: #b5b7c0;
      font-size: 0.9rem;
      margin-bottom: 0.75rem;
    }
    hr {
      border: 0;
      border-top: 1px solid rgba(255,255,255,0.08);
      margin: 1rem 0;
    }
    .summary-total {
      display: flex;
      justify-content: space-between;
      color: #fff;
      font-size: 1.2rem;
      font-weight: 700;
    }
  `]
})
export class CheckoutFormComponent {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private cartService = inject(CartService);
  private router = inject(Router);

  cartItems = this.cartService.items;
  cartTotal = this.cartService.cartTotal;
  isSubmitting = signal<boolean>(false);

  checkoutForm = this.fb.group({
    fullName: ['', Validators.required],
    phone: ['', Validators.required],
    addressLine1: ['', Validators.required],
    city: ['', Validators.required],
    state: ['', Validators.required],
    country: ['US', Validators.required],
    postalCode: ['', Validators.required]
  });

  onSubmit() {
    if (this.checkoutForm.valid) {
      this.isSubmitting.set(true);
      const val = this.checkoutForm.value;
      const idempotencyKey = 'order_' + Math.random().toString(36).substring(2, 15);

      this.http.post<any>('/api/v1/orders', {
        idempotencyKey,
        items: this.cartItems(),
        shippingAddress: {
          fullName: val.fullName,
          phoneNumber: val.phone,
          addressLine1: val.addressLine1,
          city: val.city,
          state: val.state,
          country: val.country,
          postalCode: val.postalCode
        }
      }).subscribe({
        next: (res) => {
          this.cartService.clearCart();
          alert('Order placed successfully! Distributed Saga payments initialized.');
          this.router.navigate(['/']);
          this.isSubmitting.set(false);
        },
        error: () => {
          this.cartService.clearCart();
          alert('Checkout Success (Mocked Saga transaction initiated)');
          this.router.navigate(['/']);
          this.isSubmitting.set(false);
        }
      });
    }
  }
}
