import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-error',
  template: `
    <div class="error-container" *ngIf="show">
      <div class="error-message">
        <div class="error-icon">⚠️</div>
        <h3 class="error-title">{{ title }}</h3>
        <p class="error-description">{{ message }}</p>
        <div class="error-actions" *ngIf="showRetry">
          <button 
            class="btn btn-primary" 
            (click)="onRetry()"
            [disabled]="loading">
            {{ loading ? 'Retrying...' : 'Retry' }}
          </button>
          <button 
            class="btn btn-secondary" 
            (click)="onDismiss()">
            Dismiss
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .error-container {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 9999;
    }

    .error-message {
      background: white;
      padding: 2rem;
      border-radius: 8px;
      text-align: center;
      max-width: 400px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .error-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }

    .error-title {
      color: #e74c3c;
      margin: 0 0 1rem 0;
      font-size: 1.5rem;
    }

    .error-description {
      color: #666;
      margin: 0 0 1.5rem 0;
      line-height: 1.5;
    }

    .error-actions {
      display: flex;
      gap: 1rem;
      justify-content: center;
    }

    .btn {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      transition: background-color 0.2s;
    }

    .btn-primary {
      background-color: #3498db;
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background-color: #2980b9;
    }

    .btn-primary:disabled {
      background-color: #bdc3c7;
      cursor: not-allowed;
    }

    .btn-secondary {
      background-color: #95a5a6;
      color: white;
    }

    .btn-secondary:hover {
      background-color: #7f8c8d;
    }
  `]
})
export class ErrorComponent {
  @Input() show = false;
  @Input() title = 'Error';
  @Input() message = 'An error occurred';
  @Input() showRetry = true;
  @Input() loading = false;
  @Output() retry = new EventEmitter<void>();
  @Output() dismiss = new EventEmitter<void>();

  onRetry() {
    this.retry.emit();
  }

  onDismiss() {
    this.dismiss.emit();
  }
}
