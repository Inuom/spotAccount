import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Payment } from '../../models/payment.model';

interface AuditEntry {
  timestamp: Date;
  action: string;
  actor: string;
  details: string;
  type: 'create' | 'update' | 'verify' | 'cancel';
}

@Component({
  selector: 'app-payment-audit',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="payment-audit" *ngIf="payment">
      <div class="audit-header">
        <h3>Payment Audit Log</h3>
        <span class="audit-count">{{ auditEntries.length }} entries</span>
      </div>

      <div class="audit-timeline">
        <div *ngFor="let entry of auditEntries; let isLast = last" 
             class="audit-entry" 
             [class.last]="isLast">
          
          <div class="audit-marker" [class]="entry.type"></div>
          
          <div class="audit-content">
            <div class="audit-header-row">
              <span class="audit-action">{{ entry.action }}</span>
              <span class="audit-timestamp">{{ entry.timestamp | date:'short' }}</span>
            </div>
            
            <div class="audit-details">
              <p class="audit-actor">
                <strong>{{ entry.actor }}</strong>
              </p>
              <p class="audit-description">{{ entry.details }}</p>
            </div>
          </div>
        </div>

        <div *ngIf="auditEntries.length === 0" class="no-audit-entries">
          <p>No audit entries available for this payment.</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .payment-audit {
      background: white;
      border-radius: 8px;
      padding: 1.5rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .audit-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid #e0e0e0;
    }

    .audit-header h3 {
      margin: 0;
      color: #333;
      font-size: 1.25rem;
    }

    .audit-count {
      background: #f8f9fa;
      color: #6c757d;
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.875rem;
      font-weight: 500;
    }

    .audit-timeline {
      position: relative;
      padding-left: 2rem;
    }

    .audit-timeline::before {
      content: '';
      position: absolute;
      left: 0.75rem;
      top: 0;
      bottom: 0;
      width: 2px;
      background: #e0e0e0;
    }

    .audit-entry {
      position: relative;
      margin-bottom: 1.5rem;
    }

    .audit-entry:last-child {
      margin-bottom: 0;
    }

    .audit-marker {
      position: absolute;
      left: -2rem;
      top: 0.5rem;
      width: 1rem;
      height: 1rem;
      border-radius: 50%;
      border: 2px solid white;
      box-shadow: 0 0 0 2px;
    }

    .audit-marker.create {
      background: #28a745;
      box-shadow: 0 0 0 2px #28a745;
    }

    .audit-marker.update {
      background: #ffc107;
      box-shadow: 0 0 0 2px #ffc107;
    }

    .audit-marker.verify {
      background: #007bff;
      box-shadow: 0 0 0 2px #007bff;
    }

    .audit-marker.cancel {
      background: #dc3545;
      box-shadow: 0 0 0 2px #dc3545;
    }

    .audit-content {
      background: #f8f9fa;
      border-radius: 6px;
      padding: 1rem;
      border: 1px solid #e9ecef;
    }

    .audit-header-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.75rem;
    }

    .audit-action {
      font-weight: 600;
      color: #333;
      font-size: 1rem;
    }

    .audit-timestamp {
      color: #6c757d;
      font-size: 0.875rem;
    }

    .audit-details p {
      margin: 0.25rem 0;
    }

    .audit-actor {
      color: #495057;
    }

    .audit-description {
      color: #6c757d;
      font-size: 0.9rem;
    }

    .no-audit-entries {
      text-align: center;
      padding: 2rem;
      color: #6c757d;
      font-style: italic;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .audit-header-row {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
      }
      
      .audit-entry {
        padding-left: 1.5rem;
      }
      
      .audit-timeline {
        padding-left: 1.5rem;
      }
      
      .audit-marker {
        left: -1.5rem;
      }
    }
  `]
})
export class PaymentAuditComponent implements OnInit {
  @Input() payment: Payment | null = null;

  auditEntries: AuditEntry[] = [];

  ngOnInit(): void {
    if (this.payment) {
      this.generateAuditEntries();
    }
  }

  private generateAuditEntries(): void {
    if (!this.payment) return;

    const entries: AuditEntry[] = [];

    // Creation entry
    entries.push({
      timestamp: new Date(this.payment.created_at),
      action: 'Payment Created',
      actor: this.payment.creator?.name || 'Unknown',
      details: `Payment of €${this.payment.amount} created for ${this.payment.user?.name || 'Unknown User'}`,
      type: 'create'
    });

    // Update entry (if updated after creation)
    if (new Date(this.payment.updated_at) > new Date(this.payment.created_at)) {
      entries.push({
        timestamp: new Date(this.payment.updated_at),
        action: 'Payment Updated',
        actor: this.payment.creator?.name || 'Unknown', // In real app, track who updated
        details: 'Payment details were modified',
        type: 'update'
      });
    }

    // Verification entry
    if (this.payment.status === 'VERIFIED' && this.payment.verified_at) {
      entries.push({
        timestamp: new Date(this.payment.verified_at),
        action: 'Payment Verified',
        actor: this.payment.verifier?.name || 'Unknown',
        details: this.payment.verification_reference 
          ? `Payment verified with reference: ${this.payment.verification_reference}`
          : 'Payment verified without reference',
        type: 'verify'
      });
    }

    // Cancellation entry
    if (this.payment.status === 'CANCELLED') {
      entries.push({
        timestamp: new Date(this.payment.updated_at),
        action: 'Payment Cancelled',
        actor: this.payment.creator?.name || 'Unknown', // In real app, track who cancelled
        details: 'Payment was cancelled',
        type: 'cancel'
      });
    }

    // Sort by timestamp (newest first)
    this.auditEntries = entries.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }
}
