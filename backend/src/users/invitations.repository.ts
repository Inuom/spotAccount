import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { Invitation } from '@prisma/client';

@Injectable()
export class InvitationsRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    user_id: string;
    token_hash: string;
    expires_at: Date;
  }): Promise<Invitation> {
    return this.prisma.invitation.create({
      data,
    });
  }

  async findByUserId(userId: string): Promise<Invitation | null> {
    return this.prisma.invitation.findUnique({
      where: { user_id: userId },
    });
  }

  async findByTokenHash(tokenHash: string): Promise<Invitation | null> {
    return this.prisma.invitation.findFirst({
      where: { token_hash: tokenHash },
    });
  }

  async findPendingInvitations(): Promise<Invitation[]> {
    return this.prisma.invitation.findMany({
      where: {
        redeemed_at: null,
        expires_at: {
          gt: new Date(),
        },
      },
    });
  }

  async markAsRedeemed(id: string): Promise<Invitation> {
    return this.prisma.invitation.update({
      where: { id },
      data: { redeemed_at: new Date() },
    });
  }

  async invalidateByUserId(userId: string): Promise<void> {
    const existing = await this.findByUserId(userId);
    if (existing) {
      await this.prisma.invitation.delete({
        where: { id: existing.id },
      });
    }
  }

  async deleteExpired(): Promise<number> {
    const result = await this.prisma.invitation.deleteMany({
      where: {
        expires_at: { lt: new Date() },
        redeemed_at: null,
      },
    });
    return result.count;
  }
}

