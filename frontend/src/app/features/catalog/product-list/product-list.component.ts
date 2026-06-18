import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CartService } from '../../../core/services/cart.service';

interface Product {
  _id: string;
  name: string;
  description: string;
  basePrice: number;
  brand: string;
  images: string[];
}

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="catalog-container">
      <div class="hero">
        <h1>Discover Premium Hardware & Goods</h1>
        <p>Curated list of premium quality multi-vendor merchandise</p>
      </div>

      <div class="product-grid" *ngIf="isLoading(); else productGrid">
        <div class="card skeleton-card" *ngFor="let item of [1,2,3,4,5,6]">
          <div class="skeleton-img"></div>
          <div class="skeleton-title"></div>
          <div class="skeleton-desc"></div>
          <div class="skeleton-price"></div>
        </div>
      </div>

      <ng-template #productGrid>
        <div class="product-grid">
          <div class="card product-card" *ngFor="let prod of products()">
            <div class="card-img-wrapper">
              <img [src]="prod.images[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=600'" alt="{{ prod.name }}">
            </div>
            <div class="card-body">
              <span class="brand">{{ prod.brand }}</span>
              <h3 class="name" [routerLink]="['/products', prod._id]">{{ prod.name }}</h3>
              <p class="desc">{{ prod.description | slice:0:70 }}...</p>
              <div class="footer-row">
                <span class="price">\${{ prod.basePrice | number:'1.2-2' }}</span>
                <button class="add-to-cart" (click)="addToCart(prod)">Add to Cart</button>
              </div>
            </div>
          </div>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .catalog-container {
      margin-top: 1rem;
    }
    .hero {
      text-align: center;
      padding: 3rem 0;
      background: radial-gradient(circle at center, #1b202e 0%, #0d0e12 100%);
      border-radius: 16px;
      margin-bottom: 2rem;
      border: 1px solid rgba(255, 255, 255, 0.05);
    }
    .hero h1 {
      font-size: 2.5rem;
      font-weight: 700;
      color: #fff;
      margin: 0 0 0.5rem 0;
    }
    .hero p {
      color: #929aab;
      margin: 0;
    }
    .product-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 2rem;
    }
    .card {
      background: #151821;
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 12px;
      overflow: hidden;
      transition: transform 0.3s, box-shadow 0.3s;
    }
    .product-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 12px 30px rgba(0, 0, 0, 0.5);
      border-color: rgba(79, 172, 254, 0.3);
    }
    .card-img-wrapper {
      height: 200px;
      overflow: hidden;
      background: #0d0e12;
    }
    .card-img-wrapper img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.5s;
    }
    .product-card:hover .card-img-wrapper img {
      transform: scale(1.05);
    }
    .card-body {
      padding: 1.25rem;
    }
    .brand {
      font-size: 0.75rem;
      color: #4facfe;
      text-transform: uppercase;
      font-weight: 700;
      letter-spacing: 0.05em;
    }
    .name {
      font-size: 1.1rem;
      color: #fff;
      margin: 0.25rem 0 0.5rem 0;
      font-weight: 600;
      cursor: pointer;
    }
    .name:hover {
      color: #4facfe;
    }
    .desc {
      color: #8f92a1;
      font-size: 0.85rem;
      line-height: 1.4;
      margin: 0 0 1rem 0;
    }
    .footer-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .price {
      font-size: 1.25rem;
      font-weight: 700;
      color: #fff;
    }
    .add-to-cart {
      background: #1b202e;
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: #fff;
      padding: 0.5rem 1rem;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      transition: background 0.2s, border-color 0.2s;
    }
    .add-to-cart:hover {
      background: #4facfe;
      border-color: #4facfe;
    }

    .skeleton-card {
      padding: 1.25rem;
    }
    .skeleton-img {
      height: 160px;
      background: rgba(255, 255, 255, 0.04);
      border-radius: 8px;
      margin-bottom: 1rem;
      animation: pulse 1.5s infinite;
    }
    .skeleton-title {
      height: 1.2rem;
      background: rgba(255, 255, 255, 0.04);
      width: 70%;
      margin-bottom: 0.5rem;
      border-radius: 4px;
      animation: pulse 1.5s infinite;
    }
    .skeleton-desc {
      height: 0.8rem;
      background: rgba(255, 255, 255, 0.04);
      width: 90%;
      margin-bottom: 1rem;
      border-radius: 4px;
      animation: pulse 1.5s infinite;
    }
    .skeleton-price {
      height: 1.5rem;
      background: rgba(255, 255, 255, 0.04);
      width: 40%;
      border-radius: 4px;
      animation: pulse 1.5s infinite;
    }
    @keyframes pulse {
      0% { opacity: 0.6; }
      50% { opacity: 1; }
      100% { opacity: 0.6; }
    }
  `]
})
export class ProductListComponent implements OnInit {
  private http = inject(HttpClient);
  private cartService = inject(CartService);

  products = signal<Product[]>([]);
  isLoading = signal<boolean>(true);

  ngOnInit() {
    this.http.get<any>('/api/v1/products').subscribe({
      next: (res) => {
        this.products.set(res.data || []);
        this.isLoading.set(false);
      },
      error: () => {
        this.products.set([
          {
            _id: '64f1a238f2928c001249b1a1',
            name: 'Vapor Carbon Smart Watch',
            description: 'Minimalist sleek aluminum carbon body smart watch with premium OLED display.',
            basePrice: 249.99,
            brand: 'OnyxTech',
            images: []
          },
          {
            _id: '64f1a238f2928c001249b1a2',
            name: 'Linear Mechanical Keyboard',
            description: 'Hot-swappable custom aluminum keyboard with pre-lubed linear switches.',
            basePrice: 159.00,
            brand: 'KeySmith',
            images: []
          }
        ]);
        this.isLoading.set(false);
      }
    });
  }

  addToCart(prod: Product) {
    this.cartService.addToCart({
      productId: prod._id,
      variantSku: `${prod.name.toUpperCase().slice(0,3)}-STD`,
      name: prod.name,
      price: prod.basePrice,
      quantity: 1
    });
  }
}
