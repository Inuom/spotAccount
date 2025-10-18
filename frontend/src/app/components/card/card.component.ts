import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-card',
  template: `
    <div [class]="cardClass">
      <div class="card-header" *ngIf="title || showHeader">
        <h3 class="card-title" *ngIf="title">{{ title }}</h3>
        <div class="card-actions" *ngIf="actions">
          <ng-content select="[slot=actions]"></ng-content>
        </div>
      </div>
      <div class="card-body">
        <ng-content></ng-content>
      </div>
      <div class="card-footer" *ngIf="footer">
        <ng-content select="[slot=footer]"></ng-content>
      </div>
    </div>
  `,
  styles: [`
    .card {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      overflow: hidden;
      border: 1px solid #e1e8ed;
    }

    .card-header {
      padding: 1rem 1.5rem;
      border-bottom: 1px solid #e1e8ed;
      background-color: #f8f9fa;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .card-title {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 600;
      color: #2c3e50;
    }

    .card-actions {
      display: flex;
      gap: 0.5rem;
    }

    .card-body {
      padding: 1.5rem;
    }

    .card-footer {
      padding: 1rem 1.5rem;
      border-top: 1px solid #e1e8ed;
      background-color: #f8f9fa;
    }

    .card-compact .card-header,
    .card-compact .card-body,
    .card-compact .card-footer {
      padding: 0.75rem 1rem;
    }

    .card-large .card-header,
    .card-large .card-body,
    .card-large .card-footer {
      padding: 2rem;
    }

    .card-elevated {
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    }

    .card-flat {
      box-shadow: none;
      border: 1px solid #e1e8ed;
    }
  `]
})
export class CardComponent {
  @Input() title?: string;
  @Input() footer?: boolean;
  @Input() showHeader = true;
  @Input() size: 'compact' | 'medium' | 'large' = 'medium';
  @Input() elevation: 'flat' | 'normal' | 'elevated' = 'normal';
  @Input() actions?: boolean;

  get cardClass(): string {
    const sizeClass = this.size === 'compact' ? 'card-compact' : this.size === 'large' ? 'card-large' : '';
    const elevationClass = this.elevation === 'flat' ? 'card-flat' : this.elevation === 'elevated' ? 'card-elevated' : '';
    return `card ${sizeClass} ${elevationClass}`.trim();
  }
}
