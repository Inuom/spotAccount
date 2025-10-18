import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-base',
  template: `
    <div class="base-component">
      <ng-content></ng-content>
    </div>
  `,
  styles: [`
    .base-component {
      display: block;
    }
  `]
})
export class BaseComponent {
  @Input() loading = false;
  @Input() disabled = false;
  @Output() action = new EventEmitter<any>();

  onAction(data: any) {
    if (!this.disabled && !this.loading) {
      this.action.emit(data);
    }
  }
}
