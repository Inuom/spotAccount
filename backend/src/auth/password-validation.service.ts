import { Injectable, BadRequestException } from '@nestjs/common';

export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
}

@Injectable()
export class PasswordValidationService {
  private readonly MIN_LENGTH = 8;
  private readonly MAX_LENGTH = 128;

  /**
   * Validates password complexity according to FR-011
   * Minimum 8 characters, must contain uppercase, lowercase, number, and special character
   */
  validatePasswordComplexity(password: string): PasswordValidationResult {
    const errors: string[] = [];

    if (!password || password.length === 0) {
      errors.push('Password is required');
      return { isValid: false, errors };
    }

    if (password.length < this.MIN_LENGTH) {
      errors.push(`Password must be at least ${this.MIN_LENGTH} characters long`);
    }

    if (password.length > this.MAX_LENGTH) {
      errors.push(`Password must not exceed ${this.MAX_LENGTH} characters`);
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (!/[@$!%*?&]/.test(password)) {
      errors.push('Password must contain at least one special character (@$!%*?&)');
    }

    // Check for common weak passwords
    const commonPasswords = [
      'password123',
      'Password123!',
      'Admin123!',
      '12345678',
      'qwerty123',
    ];

    if (commonPasswords.some(common => password.toLowerCase().includes(common.toLowerCase()))) {
      errors.push('Password is too common, please choose a more secure password');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validates and throws exception if password doesn't meet requirements
   */
  validateOrThrow(password: string): void {
    const result = this.validatePasswordComplexity(password);
    
    if (!result.isValid) {
      throw new BadRequestException({
        message: 'Password does not meet complexity requirements',
        errors: result.errors,
      });
    }
  }

  /**
   * Checks if password is the initial seed password (which bypasses validation)
   */
  isSeedPassword(password: string): boolean {
    return password === '0000';
  }
}

