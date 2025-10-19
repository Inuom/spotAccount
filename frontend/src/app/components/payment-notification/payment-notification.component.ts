import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Payment } from '../../models/payment.model';

interface NotificationItem {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionRequired?: boolean;
}

@Component({
  selector: 'app-payment-notification',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="payment-notification" *ngIf="payment">
      <div class="notification-header">
        <h3>Payment Notifications</h3>
        <div class="header-actions">
          <button 
            *ngIf="hasUnreadNotifications" 
            (click)="markAllAsRead()" 
            class="btn-mark-all">
            Mark All Read
          </button>
          <span class="notification-count">{{ notifications.length }}</span>
        </div>
      </div>

      <div class="notifications-list">
        <div *ngFor="let notification of notifications" 
             class="notification-item" 
             [class]="notification.type"
             [class.unread]="!notification.read">
          
          <div class="notification-icon">
            <span class="icon">{{ getNotificationIcon(notification.type) }}</span>
          </div>

          <div class="notification-content">
            <div class="notification-header-row">
              <h4 class="notification-title">{{ notification.title }}</h4>
              <div class="notification-meta">
                <span class="notification-time">{{ formatTime(notification.timestamp) }}</span>
                <span *ngIf="!notification.read" class="unread-indicator"></span>
              </div>
            </div>
            
            <p class="notification-message">{{ notification.message }}</p>
            
            <div *ngIf="notification.actionRequired" class="notification-actions">
              <button (click)="handleNotificationAction(notification)" class="btn-action">
                Take Action
              </button>
            </div>
          </div>

          <button 
            *ngIf="!notification.read" 
            (click)="markAsRead(notification.id)" 
            class="btn-mark-read">
            ×
          </button>
        </div>

        <div *ngIf="notifications.length === 0" class="no-notifications">
          <p>No notifications for this payment.</p>
        </div>
      </div>

      <!-- Quick notification preview -->
      <div class="notification-summary">
        <div class="summary-item" *ngFor="let summary of notificationSummary">
          <span class="summary-label">{{ summary.label }}:</span>
          <span class="summary-count" [class]="summary.type">{{ summary.count }}</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .payment-notification {
      background: white;
      border-radius: 8px;
      padding: 1.5rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .notification-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid #e0e0e0;
    }

    .notification-header h3 {
      margin: 0;
      color: #333;
      font-size: 1.25rem;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .btn-mark-all {
      background: #6c757d;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.875rem;
      transition: background-color 0.2s;
    }

    .btn-mark-all:hover {
      background: #5a6268;
    }

    .notification-count {
      background: #007bff;
      color: white;
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.875rem;
      font-weight: 500;
    }

    .notifications-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .notification-item {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      padding: 1rem;
      border-radius: 6px;
      border-left: 4px solid;
      transition: all 0.2s;
      position: relative;
    }

    .notification-item.success {
      background: #f8fff9;
      border-left-color: #28a745;
    }

    .notification-item.info {
      background: #f0f8ff;
      border-left-color: #007bff;
    }

    .notification-item.warning {
      background: #fffbf0;
      border-left-color: #ffc107;
    }

    .notification-item.error {
      background: #fff5f5;
      border-left-color: #dc3545;
    }

    .notification-item.unread {
      background: #f8f9fa;
      border: 1px solid #e0e0e0;
    }

    .notification-icon {
      flex-shrink: 0;
      width: 2.5rem;
      height: 2.5rem;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.2rem;
    }

    .notification-item.success .notification-icon {
      background: #d4edda;
      color: #155724;
    }

    .notification-item.info .notification-icon {
      background: #d1ecf1;
      color: #0c5460;
    }

    .notification-item.warning .notification-icon {
      background: #fff3cd;
      color: #856404;
    }

    .notification-item.error .notification-icon {
      background: #f8d7da;
      color: #721c24;
    }

    .notification-content {
      flex: 1;
    }

    .notification-header-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 0.5rem;
    }

    .notification-title {
      margin: 0;
      color: #333;
      font-size: 1rem;
      font-weight: 600;
    }

    .notification-meta {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .notification-time {
      color: #6c757d;
      font-size: 0.875rem;
    }

    .unread-indicator {
      width: 8px;
      height: 8px;
      background: #007bff;
      border-radius: 50%;
    }

    .notification-message {
      margin: 0 0 0.75rem 0;
      color: #666;
      line-height: 1.5;
    }

    .notification-actions {
      margin-top: 0.75rem;
    }

    .btn-action {
      background: #007bff;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.875rem;
      transition: background-color 0.2s;
    }

    .btn-action:hover {
      background: #0056b3;
    }

    .btn-mark-read {
      position: absolute;
      top: 0.5rem;
      right: 0.5rem;
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      color: #6c757d;
      width: 2rem;
      height: 2rem;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      transition: all 0.2s;
    }

    .btn-mark-read:hover {
      background: #f8f9fa;
      color: #495057;
    }

    .no-notifications {
      text-align: center;
      padding: 2rem;
      color: #6c757d;
      font-style: italic;
    }

    .notification-summary {
      display: flex;
      gap: 1rem;
      padding-top: 1rem;
      border-top: 1px solid #e0e0e0;
    }

    .summary-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .summary-label {
      color: #6c757d;
      font-size: 0.875rem;
    }

    .summary-count {
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.875rem;
      font-weight: 600;
      background: #e9ecef;
      color: #495057;
    }

    .summary-count.success {
      background: #d4edda;
      color: #155724;
    }

    .summary-count.warning {
      background: #fff3cd;
      color: #856404;
    }

    .summary-count.error {
      background: #f8d7da;
      color: #721c24;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .notification-header-row {
        flex-direction: column;
        gap: 0.5rem;
      }
      
      .notification-summary {
        flex-direction: column;
        gap: 0.5rem;
      }
    }
  `]
})
export class PaymentNotificationComponent implements OnInit {
  @Input() payment: Payment | null = null;
  @Output() notificationAction = new EventEmitter<{ notificationId: string; action: string }>();

  notifications: NotificationItem[] = [];
  notificationSummary: { label: string; count: number; type: string }[] = [];

  get hasUnreadNotifications(): boolean {
    return this.notifications.some(n => !n.read);
  }

  ngOnInit(): void {
    if (this.payment) {
      this.generateNotifications();
      this.updateNotificationSummary();
    }
  }

  private generateNotifications(): void {
    if (!this.payment) return;

    const notifications: NotificationItem[] = [];

    // Payment created notification
    notifications.push({
      id: 'created',
      type: 'info',
      title: 'Payment Created',
      message: `Payment of €${this.payment.amount} has been created for ${this.payment.user?.name || 'user'}. Scheduled for ${new Date(this.payment.scheduled_date).toLocaleDateString()}.`,
      timestamp: new Date(this.payment.created_at),
      read: true,
      actionRequired: false
    });

    // Status-based notifications
    if (this.payment.status === 'VERIFIED' && this.payment.verified_at) {
      notifications.push({
        id: 'verified',
        type: 'success',
        title: 'Payment Verified',
        message: `Payment has been successfully verified${this.payment.verification_reference ? ` with reference: ${this.payment.verification_reference}` : ''}.`,
        timestamp: new Date(this.payment.verified_at),
        read: false,
        actionRequired: false
      });
    } else if (this.payment.status === 'CANCELLED') {
      notifications.push({
        id: 'cancelled',
        type: 'error',
        title: 'Payment Cancelled',
        message: 'Payment has been cancelled and will not be processed.',
        timestamp: new Date(this.payment.updated_at),
        read: false,
        actionRequired: false
      });
    } else if (this.payment.status === 'PENDING') {
      const daysSinceCreated = Math.floor(
        (new Date().getTime() - new Date(this.payment.created_at).getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysSinceCreated >= 1) {
        notifications.push({
          id: 'pending_review',
          type: 'warning',
          title: 'Payment Pending Review',
          message: `Payment has been pending verification for ${daysSinceCreated} day${daysSinceCreated > 1 ? 's' : ''}. Please review and verify.`,
          timestamp: new Date(this.payment.created_at),
          read: false,
          actionRequired: true
        });
      }
    }

    this.notifications = notifications.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  private updateNotificationSummary(): void {
    const summary = [
      {
        label: 'Total',
        count: this.notifications.length,
        type: 'default'
      },
      {
        label: 'Unread',
        count: this.notifications.filter(n => !n.read).length,
        type: this.notifications.filter(n => !n.read).length > 0 ? 'warning' : 'default'
      },
      {
        label: 'Action Required',
        count: this.notifications.filter(n => n.actionRequired).length,
        type: this.notifications.filter(n => n.actionRequired).length > 0 ? 'error' : 'default'
      }
    ];

    this.notificationSummary = summary;
  }

  getNotificationIcon(type: string): string {
    switch (type) {
      case 'success':
        return '✓';
      case 'info':
        return 'ℹ';
      case 'warning':
        return '⚠';
      case 'error':
        return '✗';
      default:
        return '•';
    }
  }

  formatTime(timestamp: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - timestamp.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) {
      return 'Just now';
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else {
      return timestamp.toLocaleDateString();
    }
  }

  markAsRead(notificationId: string): void {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
      this.updateNotificationSummary();
    }
  }

  markAllAsRead(): void {
    this.notifications.forEach(notification => {
      notification.read = true;
    });
    this.updateNotificationSummary();
  }

  handleNotificationAction(notification: NotificationItem): void {
    this.notificationAction.emit({
      notificationId: notification.id,
      action: 'view_payment'
    });
  }
}
