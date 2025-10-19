import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { PasswordVerificationService } from './password-verification.service';
import { PasswordValidationService } from './password-validation.service';

@Injectable()
export class PasswordUpdateService {
  private readonly logger = new Logger(PasswordUpdateService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly passwordVerificationService: PasswordVerificationService,
    private readonly passwordValidationService: PasswordValidationService,
  ) {}

  /**
   * Updates user password with validation and verification
   */
  async updatePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    // Get user to check if they're using seed password
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Verify current password
    await this.passwordVerificationService.verifyCurrentPassword(userId, currentPassword);

    // Check if new password is same as current password
    if (currentPassword === newPassword) {
      throw new BadRequestException('New password must be different from current password');
    }

    // Validate new password complexity (unless it's the seed password being changed)
    // According to FR-011, only the initial admin seed user bypasses complexity on creation
    // But updates must follow complexity rules
    this.passwordValidationService.validateOrThrow(newPassword);

    // Hash the new password
    const newPasswordHash = await this.passwordVerificationService.hashPassword(newPassword);

    // Update password in database
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        password_hash: newPasswordHash,
        updated_at: new Date(),
      },
    });

    this.logger.log(`Password updated successfully for user ${user.email}`);
  }

  /**
   * Forces password update for a user (admin action)
   * Bypasses current password verification
   */
  async forcePasswordUpdate(
    userId: string,
    newPassword: string,
    adminUserId: string,
  ): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Validate new password complexity
    this.passwordValidationService.validateOrThrow(newPassword);

    // Hash the new password
    const newPasswordHash = await this.passwordVerificationService.hashPassword(newPassword);

    // Update password in database
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        password_hash: newPasswordHash,
        updated_at: new Date(),
      },
    });

    this.logger.log(
      `Password force-updated for user ${user.email} by admin ${adminUserId}`,
    );
  }
}

