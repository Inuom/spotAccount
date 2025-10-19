import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../database/prisma.service';
import { PasswordVerificationService } from './password-verification.service';
import { User } from '@prisma/client';

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  user: Omit<User, 'password_hash'>;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly passwordVerificationService: PasswordVerificationService,
  ) {}

  /**
   * Authenticates user and returns JWT token
   */
  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const { email, password } = loginDto;

    // Find user
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.is_active) {
      throw new UnauthorizedException('User account is inactive');
    }

    // Verify password
    const isPasswordValid = await this.passwordVerificationService.verifyPasswordByEmail(
      email,
      password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate JWT token
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const access_token = this.jwtService.sign(payload);

    // Return token and user info (without password)
    const { password_hash, ...userWithoutPassword } = user;

    return {
      access_token,
      user: userWithoutPassword as Omit<User, 'password_hash'>,
    };
  }

  /**
   * Re-authenticates user (validates password again)
   * Used before sensitive operations like password updates
   */
  async reAuthenticate(userId: string, password: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.is_active) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await this.passwordVerificationService.verifyPasswordByEmail(
      user.email,
      password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return true;
  }

  /**
   * Validates JWT token and returns user
   */
  async validateUser(payload: any): Promise<Omit<User, 'password_hash'> | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user || !user.is_active) {
      return null;
    }

    const { password_hash, ...userWithoutPassword } = user;
    return userWithoutPassword as Omit<User, 'password_hash'>;
  }
}

