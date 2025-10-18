import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-button',
  template: `
    <button 
      [class]="buttonClass"
      [disabled]="disabled || loading"
      (click)="onClick()"
      [type]="type">
      <span *ngIf="loading" class="spinner"></span>
      <span [class.hidden]="loading">{{ text }}</span>
    </button>
  `,
  styles: [`
    .btn {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.2s;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      min-width: 80px;
    }

    .btn:disabled {
      cursor: not-allowed;
      opacity: 0.6;
    }

    .btn-primary {
      background-color: #3498db;
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background-color: #2980b9;
    }

    .btn-secondary {
      background-color: #95a5a6;
      color: white;
    }

    .btn-secondary:hover:not(:disabled) {
      background-color: #7f8c8d;
    }

    .btn-success {
      background-color: #27ae60;
      color: white;
    }

    .btn-success:hover:not(:disabled) {
      background-color: #229954;
    }

    .btn-danger {
      background-color: #e74c3c;
      color: white;
    }

    .btn-danger:hover:not(:disabled) {
      background-color: #c0392b;
    }

    .btn-outline {
      background-color: transparent;
      border: 1px solid #3498db;
      color: #3498db;
    }

    .btn-outline:hover:not(:disabled) {
      background-color: #3498db;
      color: white;
    }

    .spinner {
      width: 16px;
      height: 16px;
      border: 2px solid transparent;
      border-top: 2px solid currentColor;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    .hidden {
      display: none;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `]
})
export class ButtonComponent {
  @Input() text = 'Button';
  @Input() variant: 'primary' | 'secondary' | 'success' | 'danger' | 'outline' = 'primary';
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Input() disabled = false;
  @Input() loading = false;
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Output() click = new EventEmitter<void>();

  get buttonClass(): string {
    const sizeClass = this.size === 'small' ? 'btn-sm' : this.size === 'large' ? 'btn-lg' : '';
    return `btn btn-${this.variant} ${sizeClass}`.trim();
  }

  onClick() {
    if (!this.disabled && !this.loading) {
      this.click.emit();
    }
  }
}
