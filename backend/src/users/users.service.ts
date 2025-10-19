import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { CreateUserByAdminDto } from './dto/create-user-by-admin.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { InvitationsService } from './invitations.service';
import { UserAuditService } from './user-audit.service';

export interface CreateUserWithInvitationResult {
  user: Omit<User, 'password_hash'>;
  setup_link: string;
  expires_at: Date;
}

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly invitationsService: InvitationsService,
    private readonly auditService: UserAuditService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<Omit<User, 'password_hash'>> {
    const { email, name, password, role } = createUserDto;

    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email,
        name,
        password_hash,
        role: role as Role,
        is_active: true,
      },
    });

    // Return user without password_hash
    const { password_hash: _, ...userWithoutPassword } = user;
    return userWithoutPassword as Omit<User, 'password_hash'>;
  }

  async findAll(role?: Role, is_active?: boolean): Promise<Omit<User, 'password_hash'>[]> {
    const where: any = {};
    
    if (role !== undefined) {
      where.role = role;
    }
    
    if (is_active !== undefined) {
      where.is_active = is_active;
    }

    const users = await this.prisma.user.findMany({
      where,
      orderBy: { created_at: 'desc' },
    });

    return users.map(({ password_hash, ...user }) => user as Omit<User, 'password_hash'>);
  }

  async findOne(id: string): Promise<Omit<User, 'password_hash'> | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return null;
    }

    const { password_hash, ...userWithoutPassword } = user;
    return userWithoutPassword as Omit<User, 'password_hash'>;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<Omit<User, 'password_hash'>> {
    // Check if user exists
    const existingUser = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    // Update user
    const user = await this.prisma.user.update({
      where: { id },
      data: {
        ...updateUserDto,
        role: updateUserDto.role as Role,
      },
    });

    const { password_hash, ...userWithoutPassword } = user;
    return userWithoutPassword as Omit<User, 'password_hash'>;
  }

  async remove(id: string): Promise<void> {
    const existingUser = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    await this.prisma.user.delete({
      where: { id },
    });
  }

  async validatePassword(email: string, password: string): Promise<User | null> {
    const user = await this.findByEmail(email);
    
    if (!user || !user.is_active) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    
    if (!isPasswordValid) {
      return null;
    }

    return user;
  }

  /**
   * Create a user by admin with invitation link (no password required)
   * Returns the user and a one-time setup link for password creation
   */
  async createUserWithInvitation(
    createUserDto: CreateUserByAdminDto,
    actorId: string,
  ): Promise<CreateUserWithInvitationResult> {
    const { email, name, role = Role.USER, is_active = true } = createUserDto;

    try {
      // Check if user already exists
      const existingUser = await this.prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      });

      if (existingUser) {
        await this.auditService.logUserCreateFailure(actorId, 'Email already exists', { email });
        throw new ConflictException('User with this email already exists');
      }

      // Create user with a temporary password hash (will be replaced when user sets password)
      const tempPasswordHash = await bcrypt.hash(crypto.randomBytes(32).toString('hex'), 10);

      const user = await this.prisma.user.create({
        data: {
          email: email.toLowerCase(),
          name: name.trim(),
          password_hash: tempPasswordHash,
          role: role as Role,
          is_active,
        },
      });

      // Generate invitation link
      const invitation = await this.invitationsService.generateInvitation(user.id);

      // Log audit event
      await this.auditService.logUserCreate(actorId, user.id, { role, is_active });
      await this.auditService.logInviteGenerate(actorId, user.id, invitation.expires_at);

      // Return user without password_hash
      const { password_hash: _, ...userWithoutPassword } = user;

      return {
        user: userWithoutPassword as Omit<User, 'password_hash'>,
        setup_link: invitation.setup_link,
        expires_at: invitation.expires_at,
      };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      await this.auditService.logUserCreateFailure(actorId, error.message, { email });
      throw error;
    }
  }

  /**
   * Regenerate invitation link for a user
   */
  async regenerateInvitation(userId: string, actorId: string): Promise<{ setup_link: string; expires_at: Date }> {
    // Check if user exists
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Generate new invitation link
    const invitation = await this.invitationsService.generateInvitation(userId);

    // Log audit event
    await this.auditService.logInviteRegenerate(actorId, userId, invitation.expires_at);

    return invitation;
  }

  /**
   * Set password for a user using invitation token
   */
  async setPasswordWithToken(token: string, password: string): Promise<void> {
    // Redeem the invitation token
    const userId = await this.invitationsService.redeemInvitation(token);

    // Hash the new password
    const password_hash = await bcrypt.hash(password, 10);

    // Update user password and ensure they are active
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        password_hash,
        is_active: true,
      },
    });

    // Log audit events
    await this.auditService.logInviteRedeem(userId);
    await this.auditService.logPasswordSetup(userId);
  }

  /**
   * Get invitation details for a user
   */
  async getInvitationDetails(userId: string): Promise<{ expires_at: Date } | null> {
    return this.invitationsService.getInvitationDetails(userId);
  }
}
