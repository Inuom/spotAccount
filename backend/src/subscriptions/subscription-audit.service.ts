import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { AddParticipantDto } from './dto/add-participant.dto';

@Injectable()
export class SubscriptionAuditService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Logs the addition of a participant to a subscription
   */
  async logParticipantAddition(
    subscriptionId: string,
    participantId: string,
    addedByUserId: string,
    addParticipantDto: AddParticipantDto,
  ): Promise<void> {
    try {
      // Get participant details for logging
      const participant = await this.prisma.subscriptionParticipant.findUnique({
        where: { id: participantId },
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
        },
      });

      const subscription = await this.prisma.subscription.findUnique({
        where: { id: subscriptionId },
        select: { title: true },
      });

      const addedByUser = await this.prisma.user.findUnique({
        where: { id: addedByUserId },
        select: { id: true, name: true, email: true },
      });

      // Log to console for now (can be extended to proper audit logging)
      console.log(`[AUDIT] Participant Added to Subscription`, {
        timestamp: new Date().toISOString(),
        action: 'ADD_PARTICIPANT',
        subscription: {
          id: subscriptionId,
          title: subscription?.title,
        },
        participant: {
          id: participantId,
          user_id: addParticipantDto.user_id,
          user_name: participant?.user?.name,
          user_email: participant?.user?.email,
          share_type: addParticipantDto.share_type,
          share_value: addParticipantDto.share_value,
        },
        addedBy: {
          id: addedByUserId,
          name: addedByUser?.name,
          email: addedByUser?.email,
        },
      });

      // In a production environment, this would typically write to an audit log table
      // or send to a logging service. For now, we'll just log to console.
    } catch (error) {
      // Don't fail the main operation if audit logging fails
      console.error('[AUDIT] Failed to log participant addition:', error);
    }
  }

  /**
   * Logs share recalculation when participants are added
   */
  async logShareRecalculation(
    subscriptionId: string,
    recalculatedByUserId: string,
    reason: string,
  ): Promise<void> {
    try {
      const subscription = await this.prisma.subscription.findUnique({
        where: { id: subscriptionId },
        select: { title: true, total_amount: true },
      });

      const recalculatedByUser = await this.prisma.user.findUnique({
        where: { id: recalculatedByUserId },
        select: { id: true, name: true, email: true },
      });

      console.log(`[AUDIT] Share Recalculation`, {
        timestamp: new Date().toISOString(),
        action: 'RECALCULATE_SHARES',
        subscription: {
          id: subscriptionId,
          title: subscription?.title,
          total_amount: subscription?.total_amount?.toString(),
        },
        reason,
        recalculatedBy: {
          id: recalculatedByUserId,
          name: recalculatedByUser?.name,
          email: recalculatedByUser?.email,
        },
      });
    } catch (error) {
      console.error('[AUDIT] Failed to log share recalculation:', error);
    }
  }
}
