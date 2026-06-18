import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-seller-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard">
      <h2>Seller Dashboard</h2>
      <p>Manage your inventory, pricing, and view analytics stats.</p>
      
      <div class="stats-row">
        <div class="stat-card">
          <h4>Total Sales</h4>
          <span class="value">$12,450.00</span>
        </div>
        <div class="stat-card">
          <h4>Active Products</h4>
          <span class="value">24</span>
        </div>
        <div class="stat-card">
          <h4>Pending Shipments</h4>
          <span class="value">3</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard { margin-top: 1rem; }
    h2 { color: #fff; font-size: 2rem; margin-bottom: 0.5rem; }
    p { color: #929aab; margin-bottom: 2rem; }
    .stats-row { display: flex; gap: 2rem; flex-wrap: wrap; }
    .stat-card {
      background: #151821;
      border: 1px solid rgba(255,255,255,0.06);
      border-radius: 12px;
      padding: 1.5rem;
      min-width: 200px;
      flex: 1;
    }
    .stat-card h4 { color: #b5b7c0; margin: 0 0 0.5rem 0; font-size: 0.9rem; }
    .stat-card .value { color: #fff; font-size: 1.75rem; font-weight: 700; }
  `]
})
export class SellerDashboardComponent {}
