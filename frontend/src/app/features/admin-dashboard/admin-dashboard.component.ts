import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard">
      <h2>Admin Dashboard</h2>
      <p>Configure system parameters, approve sellers, lock accounts, and review audit logs.</p>
      
      <div class="stats-row">
        <div class="stat-card">
          <h4>Total Registrations</h4>
          <span class="value">1,480</span>
        </div>
        <div class="stat-card">
          <h4>Pending Sellers</h4>
          <span class="value">12</span>
        </div>
        <div class="stat-card">
          <h4>System Health</h4>
          <span class="value health-good">Excellent</span>
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
    .health-good { color: #2ed573 !important; }
  `]
})
export class AdminDashboardComponent {}
