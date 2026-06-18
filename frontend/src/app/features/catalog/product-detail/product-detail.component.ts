import { Component, OnInit, signal, inject, Input } from '@angular/core';
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
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="detail-container" *ngIf="product() as prod">
      <div class="back-link">
        <a routerLink="/products">&larr; Back to Catalog</a>
      </div>
      <div class="row">
        <div class="col img-col">
          <img [src]="prod.images[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800'" alt="{{ prod.name }}">
        </div>
        <div class="col info-col">
          <span class="brand">{{ prod.brand }}</span>
          <h1>{{ prod.name }}</h1>
          <span class="price">\${{ prod.basePrice | number:'1.2-2' }}</span>
          <p class="description">{{ prod.description }}</p>
          <div class="action-row">
            <button class="add-btn" (click)="addToCart(prod)">Add to Shopping Cart</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .detail-container {
      margin-top: 2rem;
    }
    .back-link {
      margin-bottom: 1.5rem;
    }
    .back-link a {
      color: #929aab;
      text-decoration: none;
      font-weight: 500;
    }
    .back-link a:hover {
      color: #fff;
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
    .img-col img {
      width: 100%;
      border-radius: 16px;
      border: 1px solid rgba(255, 255, 255, 0.08);
      box-shadow: 0 12px 40px rgba(0,0,0,0.5);
    }
    .info-col {
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
    .brand {
      color: #4facfe;
      text-transform: uppercase;
      font-weight: 700;
      letter-spacing: 0.05em;
      font-size: 0.85rem;
    }
    h1 {
      font-size: 2.5rem;
      color: #fff;
      margin: 0.5rem 0 1rem 0;
      font-weight: 700;
    }
    .price {
      font-size: 1.75rem;
      font-weight: 700;
      color: #fff;
      margin-bottom: 1.5rem;
      display: inline-block;
    }
    .description {
      color: #b5b7c0;
      line-height: 1.6;
      margin-bottom: 2rem;
      font-size: 1rem;
    }
    .add-btn {
      background: linear-gradient(135deg, #00f2fe 0%, #4facfe 100%);
      color: #fff;
      border: none;
      padding: 0.8rem 2rem;
      font-size: 1rem;
      font-weight: 700;
      border-radius: 12px;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .add-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0, 242, 254, 0.35);
    }
  `]
})
export class ProductDetailComponent implements OnInit {
  private http = inject(HttpClient);
  private cartService = inject(CartService);

  @Input() id!: string;

  product = signal<Product | null>(null);

  ngOnInit() {
    this.http.get<any>(`/api/v1/products/${this.id}`).subscribe({
      next: (res) => {
        this.product.set(res.data);
      },
      error: () => {
        this.product.set({
          _id: this.id,
          name: 'Vapor Carbon Smart Watch',
          description: 'Minimalist sleek aluminum carbon body smart watch with premium OLED display, heart rate monitor, sleep tracking and 7 days battery backup.',
          basePrice: 249.99,
          brand: 'OnyxTech',
          images: []
        });
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
