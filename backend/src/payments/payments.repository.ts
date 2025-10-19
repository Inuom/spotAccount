import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { Payment, Prisma, PaymentStatus } from '@prisma/client';

@Injectable()
export class PaymentsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.PaymentCreateInput): Promise<Payment> {
    return this.prisma.payment.create({ data });
  }

  async findMany(params?: {
    status?: PaymentStatus;
    user_id?: string;
    charge_id?: string;
    skip?: number;
    take?: number;
    orderBy?: Prisma.PaymentOrderByWithRelationInput;
  }): Promise<Payment[]> {
    const { status, user_id, charge_id, skip, take, orderBy } = params || {};
    return this.prisma.payment.findMany({
      where: {
        ...(status && { status }),
        ...(user_id && { user_id }),
        ...(charge_id && { charge_id }),
      },
      skip,
      take,
      orderBy,
      include: {
        user: true,
        charge: {
          include: {
            subscription: true,
          },
        },
        creator: true,
        verifier: true,
      },
    });
  }

  async findById(id: string): Promise<Payment | null> {
    return this.prisma.payment.findUnique({
      where: { id },
      include: {
        user: true,
        charge: {
          include: {
            subscription: true,
          },
        },
        creator: true,
        verifier: true,
      },
    });
  }

  async update(id: string, data: Prisma.PaymentUpdateInput): Promise<Payment> {
    return this.prisma.payment.update({
      where: { id },
      data,
      include: {
        user: true,
        charge: {
          include: {
            subscription: true,
          },
        },
        creator: true,
        verifier: true,
      },
    });
  }

  async delete(id: string): Promise<Payment> {
    return this.prisma.payment.delete({
      where: { id },
      include: {
        user: true,
        charge: {
          include: {
            subscription: true,
          },
        },
        creator: true,
        verifier: true,
      },
    });
  }

  async count(params?: {
    status?: PaymentStatus;
    user_id?: string;
    charge_id?: string;
  }): Promise<number> {
    const { status, user_id, charge_id } = params || {};
    return this.prisma.payment.count({
      where: {
        ...(status && { status }),
        ...(user_id && { user_id }),
        ...(charge_id && { charge_id }),
      },
    });
  }
}
