import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CartService, CartItem } from '../../../core/services/cart.service';

@Component({
  selector: 'app-cart-view',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="cart-container">
      <h2>Your Shopping Cart</h2>

      <div *ngIf="items().length === 0; else cartContent" class="empty-state">
        <span class="material-icons empty-icon">shopping_cart</span>
        <h3>Your cart is empty</h3>
        <p>Looks like you haven't added anything to your cart yet.</p>
        <button routerLink="/products" class="shop-now-btn">Shop Now</button>
      </div>

      <ng-template #cartContent>
        <div class="cart-layout">
          <div class="items-list">
            <div class="cart-item" *ngFor="let item of items()">
              <div class="item-details">
                <span class="sku">{{ item.variantSku }}</span>
                <h3>{{ item.name }}</h3>
                <span class="unit-price">\${{ item.price | number:'1.2-2' }}</span>
              </div>
              <div class="item-actions">
                <div class="quantity-picker">
                  <button (click)="changeQty(item, -1)">&minus;</button>
                  <span>{{ item.quantity }}</span>
                  <button (click)="changeQty(item, 1)">&plus;</button>
                </div>
                <span class="total-price">\${{ (item.price * item.quantity) | number:'1.2-2' }}</span>
                <button class="delete-btn" (click)="removeItem(item)">
                  <span class="material-icons">delete</span>
                </button>
              </div>
            </div>
          </div>

          <div class="cart-summary">
            <h3>Order Summary</h3>
            <div class="summary-row">
              <span>Subtotal</span>
              <span>\${{ cartTotal() | number:'1.2-2' }}</span>
            </div>
            <div class="summary-row">
              <span>Shipping</span>
              <span>Free</span>
            </div>
            <hr>
            <div class="summary-row total-row">
              <span>Grand Total</span>
              <span>\${{ cartTotal() | number:'1.2-2' }}</span>
            </div>
            <button class="checkout-btn" routerLink="/checkout">Proceed to Checkout</button>
          </div>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .cart-container {
      margin-top: 1rem;
    }
    h2 {
      font-size: 2rem;
      color: #fff;
      margin-bottom: 2rem;
    }
    .empty-state {
      text-align: center;
      padding: 5rem 0;
      background: #151821;
      border: 1px solid rgba(255,255,255,0.06);
      border-radius: 16px;
    }
    .empty-icon {
      font-size: 4rem;
      color: #686b75;
      margin-bottom: 1rem;
    }
    .empty-state h3 {
      font-size: 1.5rem;
      color: #fff;
      margin: 0 0 0.5rem 0;
    }
    .empty-state p {
      color: #929aab;
      margin: 0 0 2rem 0;
    }
    .shop-now-btn {
      background: #4facfe;
      color: #fff;
      border: none;
      padding: 0.8rem 2rem;
      border-radius: 10px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
    }
    .cart-layout {
      display: flex;
      flex-wrap: wrap;
      gap: 2.5rem;
    }
    .items-list {
      flex: 2;
      min-width: 350px;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    .cart-item {
      background: #151821;
      border: 1px solid rgba(255,255,255,0.05);
      border-radius: 12px;
      padding: 1.5rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1.5rem;
    }
    .item-details h3 {
      font-size: 1.1rem;
      color: #fff;
      margin: 0.25rem 0 0.5rem 0;
    }
    .sku {
      font-size: 0.75rem;
      color: #4facfe;
      font-weight: 700;
    }
    .unit-price {
      color: #b5b7c0;
      font-size: 0.9rem;
    }
    .item-actions {
      display: flex;
      align-items: center;
      gap: 2rem;
    }
    .quantity-picker {
      display: flex;
      align-items: center;
      background: #1b202e;
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 8px;
      overflow: hidden;
    }
    .quantity-picker button {
      background: none;
      border: none;
      color: #fff;
      width: 32px;
      height: 32px;
      font-size: 1.25rem;
      cursor: pointer;
    }
    .quantity-picker button:hover {
      background: rgba(255,255,255,0.05);
    }
    .quantity-picker span {
      width: 32px;
      text-align: center;
      color: #fff;
      font-weight: 600;
    }
    .total-price {
      font-size: 1.15rem;
      font-weight: 700;
      color: #fff;
      min-width: 80px;
      text-align: right;
    }
    .delete-btn {
      background: none;
      border: none;
      color: #ff4757;
      cursor: pointer;
    }
    .cart-summary {
      flex: 1;
      min-width: 280px;
      background: #151821;
      border: 1px solid rgba(255,255,255,0.05);
      border-radius: 12px;
      padding: 1.5rem;
      height: fit-content;
    }
    .cart-summary h3 {
      font-size: 1.25rem;
      color: #fff;
      margin-top: 0;
      margin-bottom: 1.5rem;
    }
    .summary-row {
      display: flex;
      justify-content: space-between;
      color: #b5b7c0;
      margin-bottom: 0.75rem;
    }
    .summary-row.total-row {
      color: #fff;
      font-size: 1.25rem;
      font-weight: 700;
      margin-top: 0.75rem;
    }
    hr {
      border: 0;
      border-top: 1px solid rgba(255,255,255,0.08);
      margin: 1rem 0;
    }
    .checkout-btn {
      width: 100%;
      background: linear-gradient(135deg, #00f2fe 0%, #4facfe 100%);
      color: #fff;
      border: none;
      padding: 0.9rem;
      border-radius: 10px;
      font-size: 1rem;
      font-weight: 700;
      cursor: pointer;
      margin-top: 1.5rem;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .checkout-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0, 242, 254, 0.3);
    }
  `]
})
export class CartViewComponent {
  private cartService = inject(CartService);

  items = this.cartService.items;
  cartTotal = this.cartService.cartTotal;

  changeQty(item: CartItem, delta: number) {
    const newQty = item.quantity + delta;
    if (newQty > 0) {
      this.cartService.updateQuantity(item.variantSku, newQty);
    } else {
      this.removeItem(item);
    }
  }

  removeItem(item: CartItem) {
    this.cartService.removeFromCart(item.variantSku);
  }
}
