import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { PublicBalanceService } from '../../../services/public-balance.service';
import { PublicSubscriptionBalance } from '../../../models/public-balance.model';

@Component({
  selector: 'app-public-subscription-balance',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="public-balance-container">
      @if (loading) {
        <div class="loading">
          <p>Loading balance information...</p>
        </div>
      } @else if (error) {
        <div class="error-state">
          <h2>Link not found or expired</h2>
          <p>{{ error }}</p>
        </div>
      } @else if (balance) {
        <div class="balance-content">
          <h1 class="subscription-title">{{ balance.subscription_title }}</h1>
          <div class="subscription-info">
            <div class="info-row">
              <span class="label">Total monthly amount:</span>
              <span class="value">€{{ balance.total_amount | number:'1.2-2' }}</span>
            </div>
            <div class="info-row">
              <span class="label">Billing day:</span>
              <span class="value">{{ balance.billing_day }} of each month</span>
            </div>
            <div class="info-row">
              <span class="label">Balance as of:</span>
              <span class="value">{{ balance.snapshot_date }}</span>
            </div>
          </div>

          <div class="participants-section">
            <h2>Participant Balances</h2>
            <div class="table-wrapper">
              <table class="participants-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Total Charges</th>
                    <th>Verified Payments</th>
                    <th>Pending Payments</th>
                    <th>Balance Due</th>
                  </tr>
                </thead>
                <tbody>
                  @for (pb of balance.user_balances; track pb.user_name) {
                    <tr>
                      <td class="name-cell">{{ pb.user_name }}</td>
                      <td>€{{ pb.total_charges | number:'1.2-2' }}</td>
                      <td>€{{ pb.total_verified_payments | number:'1.2-2' }}</td>
                      <td>€{{ pb.total_pending_payments | number:'1.2-2' }}</td>
                      <td class="balance-cell" [class.owing]="pb.balance_due > 0">€{{ pb.balance_due | number:'1.2-2' }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
            <div class="summary">
              <span>Overall balance due: <strong>€{{ balance.overall_balance_due | number:'1.2-2' }}</strong></span>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .public-balance-container {
      padding: 1.5rem;
      max-width: 900px;
      margin: 0 auto;
      min-height: 100vh;
      font-family: system-ui, -apple-system, sans-serif;
    }

    .loading, .error-state {
      text-align: center;
      padding: 4rem 2rem;
    }

    .error-state h2 {
      color: #c00;
      margin-bottom: 1rem;
    }

    .subscription-title {
      font-size: 1.75rem;
      margin: 0 0 1.5rem 0;
      color: #1a1a1a;
    }

    .subscription-info {
      background: #f5f5f5;
      padding: 1rem 1.5rem;
      border-radius: 8px;
      margin-bottom: 2rem;
    }

    .info-row {
      display: flex;
      justify-content: space-between;
      padding: 0.5rem 0;
      gap: 2rem;
    }

    .info-row .label {
      color: #555;
    }

    .info-row .value {
      font-weight: 500;
    }

    .participants-section h2 {
      font-size: 1.25rem;
      margin: 0 0 1rem 0;
      color: #333;
    }

    .table-wrapper {
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
    }

    .participants-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.95rem;
    }

    .participants-table th,
    .participants-table td {
      padding: 0.75rem 1rem;
      text-align: left;
      border-bottom: 1px solid #e0e0e0;
    }

    .participants-table th {
      background: #f0f0f0;
      font-weight: 600;
      color: #444;
    }

    .participants-table tbody tr:hover {
      background: #fafafa;
    }

    .balance-cell.owing {
      color: #c00;
      font-weight: 600;
    }

    .summary {
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 2px solid #333;
    }

    @media (max-width: 640px) {
      .public-balance-container {
        padding: 1rem;
      }
      .participants-table {
        font-size: 0.85rem;
      }
      .participants-table th,
      .participants-table td {
        padding: 0.5rem 0.5rem;
      }
    }
  `]
})
export class PublicSubscriptionBalanceComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private publicBalanceService = inject(PublicBalanceService);

  balance: PublicSubscriptionBalance | null = null;
  loading = true;
  error: string | null = null;

  ngOnInit(): void {
    const shareToken = this.route.snapshot.paramMap.get('shareToken');
    if (!shareToken) {
      this.error = 'Invalid link.';
      this.loading = false;
      return;
    }

    this.publicBalanceService.getSubscriptionBalance(shareToken).subscribe({
      next: (data) => {
        this.balance = data;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.error = err.status === 404
          ? 'This link is no longer valid or has been revoked.'
          : err.error?.message || 'Failed to load balance. Please try again later.';
      }
    });
  }
}
