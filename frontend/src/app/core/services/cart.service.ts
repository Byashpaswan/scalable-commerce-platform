import { Injectable, signal, computed } from '@angular/core';

export interface CartItem {
  productId: string;
  variantSku: string;
  name: string;
  price: number;
  quantity: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private _items = signal<CartItem[]>([]);

  items = computed(() => this._items());
  cartCount = computed(() => this._items().reduce((acc, item) => acc + item.quantity, 0));
  cartTotal = computed(() => this._items().reduce((acc, item) => acc + (item.price * item.quantity), 0));

  constructor() {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      this._items.set(JSON.parse(savedCart));
    }
  }

  addToCart(item: CartItem) {
    const current = this._items();
    const idx = current.findIndex(i => i.variantSku === item.variantSku);
    if (idx > -1) {
      current[idx].quantity += item.quantity;
      this._items.set([...current]);
    } else {
      this._items.set([...current, item]);
    }
    this.saveCart();
  }

  updateQuantity(sku: string, quantity: number) {
    const current = this._items();
    const idx = current.findIndex(i => i.variantSku === sku);
    if (idx > -1) {
      current[idx].quantity = quantity;
      this._items.set([...current]);
      this.saveCart();
    }
  }

  removeFromCart(sku: string) {
    const filtered = this._items().filter(i => i.variantSku !== sku);
    this._items.set(filtered);
    this.saveCart();
  }

  clearCart() {
    this._items.set([]);
    localStorage.removeItem('cart');
  }

  private saveCart() {
    localStorage.setItem('cart', JSON.stringify(this._items()));
  }
}
