import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard-container">
      <h1>Admin Dashboard</h1>
      <p>Dashboard component - to be implemented in Phase 3</p>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 2rem;
    }
  `]
})
export class DashboardComponent {}

