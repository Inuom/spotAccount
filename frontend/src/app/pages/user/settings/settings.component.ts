import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PasswordUpdateComponent } from '../../../components/password-update/password-update.component';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, PasswordUpdateComponent],
  template: `
    <div class="settings-container">
      <div class="settings-header">
        <h1>Account Settings</h1>
        <p class="description">Manage your account preferences and security</p>
      </div>

      <div class="settings-sections">
        <!-- Password Section -->
        <div class="settings-section">
          <div class="section-header">
            <h2>Password & Security</h2>
            <p>Update your password to keep your account secure</p>
          </div>
          
          <div class="section-content">
            <app-password-update
              (cancel)="onPasswordUpdateCancel()"
              (success)="onPasswordUpdateSuccess()">
            </app-password-update>
          </div>
        </div>

        <!-- Profile Section (Placeholder for future) -->
        <div class="settings-section">
          <div class="section-header">
            <h2>Profile Information</h2>
            <p>View and update your profile details</p>
          </div>
          
          <div class="section-content">
            <div class="coming-soon">
              <p>Profile management features coming soon</p>
            </div>
          </div>
        </div>

        <!-- Notifications Section (Placeholder for future) -->
        <div class="settings-section">
          <div class="section-header">
            <h2>Notification Preferences</h2>
            <p>Manage how you receive notifications</p>
          </div>
          
          <div class="section-content">
            <div class="coming-soon">
              <p>Notification preferences coming soon</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .settings-container {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .settings-header {
      margin-bottom: 3rem;
    }

    .settings-header h1 {
      margin: 0 0 0.5rem 0;
      color: #333;
      font-size: 2rem;
    }

    .description {
      margin: 0;
      color: #666;
      font-size: 1rem;
    }

    .settings-sections {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .settings-section {
      background: white;
      border-radius: 8px;
      padding: 2rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .section-header {
      margin-bottom: 2rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid #e0e0e0;
    }

    .section-header h2 {
      margin: 0 0 0.5rem 0;
      color: #333;
      font-size: 1.5rem;
    }

    .section-header p {
      margin: 0;
      color: #666;
      font-size: 0.95rem;
    }

    .section-content {
      /* Content will be styled by child components */
    }

    .coming-soon {
      text-align: center;
      padding: 3rem;
      background: #f8f9fa;
      border-radius: 4px;
      border: 1px dashed #dee2e6;
    }

    .coming-soon p {
      margin: 0;
      color: #6c757d;
      font-style: italic;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .settings-container {
        padding: 1rem;
      }

      .settings-header h1 {
        font-size: 1.5rem;
      }

      .section-header h2 {
        font-size: 1.25rem;
      }

      .settings-section {
        padding: 1.5rem;
      }
    }
  `]
})
export class SettingsComponent {
  onPasswordUpdateCancel(): void {
    console.log('Password update cancelled');
  }

  onPasswordUpdateSuccess(): void {
    console.log('Password update successful');
  }
}

