import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { ChargeShare, ShareStatus, Prisma } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class ChargeSharesService {
  constructor(private readonly prisma: PrismaService) {}

  async calculateShare(
    chargeId: string,
    userId: string,
    amountPaid: Decimal,
  ): Promise<ChargeShare> {
    const chargeShare = await this.prisma.chargeShare.findFirst({
      where: {
        charge_id: chargeId,
        user_id: userId,
      },
      include: {
        charge: true,
        user: true,
      },
    });

    if (!chargeShare) {
      throw new NotFoundException('Charge share not found');
    }

    // Update amount paid
    const newAmountPaid = chargeShare.amount_paid.add(amountPaid);

    // Check if payment exceeds amount due
    if (newAmountPaid.gt(chargeShare.amount_due)) {
      throw new BadRequestException('Payment amount exceeds amount due');
    }

    // Determine new status
    let newStatus = chargeShare.status;
    if (newAmountPaid.gte(chargeShare.amount_due)) {
      newStatus = ShareStatus.SETTLED;
    } else if (newAmountPaid.gt(0)) {
      newStatus = ShareStatus.OPEN; // Still has remaining balance
    }

    // Update the charge share
    return this.prisma.chargeShare.update({
      where: { id: chargeShare.id },
      data: {
        amount_paid: newAmountPaid,
        status: newStatus,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        charge: {
          select: {
            id: true,
            amount_total: true,
            period_start: true,
            period_end: true,
          },
        },
      },
    });
  }

  async settleShare(chargeShareId: string): Promise<ChargeShare> {
    const chargeShare = await this.prisma.chargeShare.findUnique({
      where: { id: chargeShareId },
    });

    if (!chargeShare) {
      throw new NotFoundException('Charge share not found');
    }

    return this.prisma.chargeShare.update({
      where: { id: chargeShareId },
      data: {
        status: ShareStatus.SETTLED,
        amount_paid: chargeShare.amount_due, // Ensure full amount is marked as paid
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        charge: {
          select: {
            id: true,
            amount_total: true,
            period_start: true,
            period_end: true,
          },
        },
      },
    });
  }

  async getUserChargeShares(userId: string, status?: ShareStatus): Promise<ChargeShare[]> {
    const where: Prisma.ChargeShareWhereInput = {
      user_id: userId,
    };

    if (status !== undefined) {
      where.status = status;
    }

    return this.prisma.chargeShare.findMany({
      where,
      include: {
        charge: {
          include: {
            subscription: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        charge: {
          period_start: 'desc',
        },
      },
    });
  }

  async getPendingShares(userId: string): Promise<ChargeShare[]> {
    return this.getUserChargeShares(userId, ShareStatus.OPEN);
  }

  async getSettledShares(userId: string): Promise<ChargeShare[]> {
    return this.getUserChargeShares(userId, ShareStatus.SETTLED);
  }

  async calculateUserBalance(userId: string, asOfDate?: Date): Promise<{
    total_due: Decimal;
    total_paid: Decimal;
    balance: Decimal;
  }> {
    const where: Prisma.ChargeShareWhereInput = {
      user_id: userId,
    };

    if (asOfDate) {
      where.charge = {
        period_start: { lte: asOfDate },
      };
    }

    const shares = await this.prisma.chargeShare.findMany({
      where,
      include: {
        charge: true,
      },
    });

    const totalDue = shares.reduce((sum, share) => sum.add(share.amount_due), new Decimal(0));
    const totalPaid = shares.reduce((sum, share) => sum.add(share.amount_paid), new Decimal(0));
    const balance = totalDue.sub(totalPaid);

    return {
      total_due: totalDue,
      total_paid: totalPaid,
      balance,
    };
  }
}
