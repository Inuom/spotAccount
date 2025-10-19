import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class PasswordVerificationService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Verifies that the provided current password matches the user's stored password
   */
  async verifyCurrentPassword(userId: string, currentPassword: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (!user.is_active) {
      throw new UnauthorizedException('User account is inactive');
    }

    const isValid = await bcrypt.compare(currentPassword, user.password_hash);
    
    if (!isValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    return true;
  }

  /**
   * Verifies password for a user by email (used for login)
   */
  async verifyPasswordByEmail(email: string, password: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.is_active) {
      return false;
    }

    return bcrypt.compare(password, user.password_hash);
  }

  /**
   * Hashes a password using bcrypt
   */
  async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }
}

