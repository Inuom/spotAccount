import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Payment } from '../../models/payment.model';

interface WorkflowStep {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'current' | 'pending';
  icon: string;
  timestamp?: Date;
  actor?: string;
}

@Component({
  selector: 'app-payment-workflow',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="payment-workflow" *ngIf="payment">
      <div class="workflow-header">
        <h3>Payment Workflow</h3>
        <span class="workflow-status">{{ currentStepLabel }}</span>
      </div>

      <div class="workflow-steps">
        <div *ngFor="let step of workflowSteps; let i = index" 
             class="workflow-step" 
             [class]="step.status">
          
          <div class="step-icon">
            <span class="icon" *ngIf="step.status === 'completed'">✓</span>
            <span class="icon" *ngIf="step.status === 'current'">⏳</span>
            <span class="icon" *ngIf="step.status === 'pending'">{{ i + 1 }}</span>
          </div>

          <div class="step-content">
            <div class="step-header">
              <h4 class="step-title">{{ step.title }}</h4>
              <span *ngIf="step.timestamp" class="step-timestamp">
                {{ step.timestamp | date:'short' }}
              </span>
            </div>
            
            <p class="step-description">{{ step.description }}</p>
            
            <div *ngIf="step.actor" class="step-actor">
              by <strong>{{ step.actor }}</strong>
            </div>
          </div>

          <div *ngIf="!isLastStep(step)" class="step-connector"></div>
        </div>
      </div>

      <div class="workflow-actions" *ngIf="canTakeAction">
        <div class="action-info">
          <p><strong>Next Action:</strong> {{ nextActionDescription }}</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .payment-workflow {
      background: white;
      border-radius: 8px;
      padding: 1.5rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .workflow-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid #e0e0e0;
    }

    .workflow-header h3 {
      margin: 0;
      color: #333;
      font-size: 1.25rem;
    }

    .workflow-status {
      background: #e3f2fd;
      color: #1976d2;
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.875rem;
      font-weight: 500;
    }

    .workflow-steps {
      position: relative;
    }

    .workflow-step {
      position: relative;
      display: flex;
      align-items: flex-start;
      margin-bottom: 2rem;
    }

    .workflow-step:last-child {
      margin-bottom: 0;
    }

    .step-icon {
      flex-shrink: 0;
      width: 2.5rem;
      height: 2.5rem;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 1rem;
      position: relative;
      z-index: 2;
    }

    .workflow-step.completed .step-icon {
      background: #28a745;
      color: white;
    }

    .workflow-step.current .step-icon {
      background: #007bff;
      color: white;
      animation: pulse 2s infinite;
    }

    .workflow-step.pending .step-icon {
      background: #e9ecef;
      color: #6c757d;
      border: 2px solid #dee2e6;
    }

    .step-icon .icon {
      font-size: 1.2rem;
      font-weight: bold;
    }

    @keyframes pulse {
      0% {
        box-shadow: 0 0 0 0 rgba(0, 123, 255, 0.7);
      }
      70% {
        box-shadow: 0 0 0 10px rgba(0, 123, 255, 0);
      }
      100% {
        box-shadow: 0 0 0 0 rgba(0, 123, 255, 0);
      }
    }

    .step-content {
      flex: 1;
      padding-top: 0.25rem;
    }

    .step-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 0.5rem;
    }

    .step-title {
      margin: 0;
      color: #333;
      font-size: 1.1rem;
      font-weight: 600;
    }

    .workflow-step.completed .step-title {
      color: #28a745;
    }

    .workflow-step.current .step-title {
      color: #007bff;
    }

    .workflow-step.pending .step-title {
      color: #6c757d;
    }

    .step-timestamp {
      color: #6c757d;
      font-size: 0.875rem;
    }

    .step-description {
      margin: 0 0 0.5rem 0;
      color: #666;
      line-height: 1.5;
    }

    .step-actor {
      color: #495057;
      font-size: 0.9rem;
    }

    .step-connector {
      position: absolute;
      left: 1.375rem;
      top: 2.5rem;
      width: 2px;
      height: 2rem;
      background: #dee2e6;
      z-index: 1;
    }

    .workflow-step.completed .step-connector {
      background: #28a745;
    }

    .workflow-actions {
      margin-top: 1.5rem;
      padding-top: 1.5rem;
      border-top: 1px solid #e0e0e0;
    }

    .action-info {
      background: #f8f9fa;
      padding: 1rem;
      border-radius: 4px;
      border-left: 4px solid #007bff;
    }

    .action-info p {
      margin: 0;
      color: #495057;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .workflow-step {
        flex-direction: column;
        align-items: center;
        text-align: center;
      }

      .step-icon {
        margin-right: 0;
        margin-bottom: 1rem;
      }

      .step-header {
        flex-direction: column;
        align-items: center;
        gap: 0.5rem;
      }

      .step-connector {
        display: none;
      }
    }
  `]
})
export class PaymentWorkflowComponent implements OnInit {
  @Input() payment: Payment | null = null;

  workflowSteps: WorkflowStep[] = [];
  currentStepLabel = '';
  canTakeAction = false;
  nextActionDescription = '';

  ngOnInit(): void {
    if (this.payment) {
      this.generateWorkflowSteps();
      this.updateWorkflowState();
    }
  }

  private generateWorkflowSteps(): void {
    if (!this.payment) return;

    const steps: WorkflowStep[] = [];

    // Step 1: Payment Created
    steps.push({
      id: 'created',
      title: 'Payment Created',
      description: `Payment of €${this.payment.amount} created for ${this.payment.user?.name || 'user'}`,
      status: 'completed',
      icon: '1',
      timestamp: new Date(this.payment.created_at),
      actor: this.payment.creator?.name
    });

    // Step 2: Payment Processing
    if (this.payment.status === 'PENDING') {
      steps.push({
        id: 'processing',
        title: 'Awaiting Verification',
        description: 'Payment is pending verification by an administrator',
        status: 'current',
        icon: '2'
      });
    } else {
      steps.push({
        id: 'processing',
        title: 'Payment Processing',
        description: 'Payment has been processed',
        status: 'completed',
        icon: '2'
      });
    }

    // Step 3: Verification
    if (this.payment.status === 'VERIFIED') {
      steps.push({
        id: 'verified',
        title: 'Payment Verified',
        description: this.payment.verification_reference 
          ? `Payment verified with reference: ${this.payment.verification_reference}`
          : 'Payment has been verified and processed',
        status: 'completed',
        icon: '3',
        timestamp: new Date(this.payment.verified_at!),
        actor: this.payment.verifier?.name
      });
    } else if (this.payment.status === 'CANCELLED') {
      steps.push({
        id: 'verified',
        title: 'Payment Cancelled',
        description: 'Payment was cancelled and will not be processed',
        status: 'completed',
        icon: '3',
        timestamp: new Date(this.payment.updated_at)
      });
    } else {
      steps.push({
        id: 'verified',
        title: 'Payment Verification',
        description: 'Payment will be verified and processed',
        status: 'pending',
        icon: '3'
      });
    }

    this.workflowSteps = steps;
  }

  private updateWorkflowState(): void {
    if (!this.payment) return;

    switch (this.payment.status) {
      case 'PENDING':
        this.currentStepLabel = 'Pending Verification';
        this.canTakeAction = true;
        this.nextActionDescription = 'Administrator can verify or cancel the payment';
        break;
      case 'VERIFIED':
        this.currentStepLabel = 'Verified';
        this.canTakeAction = false;
        this.nextActionDescription = 'Payment has been successfully verified and processed';
        break;
      case 'CANCELLED':
        this.currentStepLabel = 'Cancelled';
        this.canTakeAction = false;
        this.nextActionDescription = 'Payment has been cancelled';
        break;
      default:
        this.currentStepLabel = 'Unknown Status';
        this.canTakeAction = false;
        this.nextActionDescription = '';
    }
  }

  isLastStep(step: WorkflowStep): boolean {
    return this.workflowSteps[this.workflowSteps.length - 1] === step;
  }
}
