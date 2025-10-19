import { Injectable, Logger } from '@nestjs/common';

export enum AuditAction {
  USER_CREATE = 'USER_CREATE',
  USER_UPDATE = 'USER_UPDATE',
  USER_DELETE = 'USER_DELETE',
  INVITE_GENERATE = 'INVITE_GENERATE',
  INVITE_REGENERATE = 'INVITE_REGENERATE',
  INVITE_REDEEM = 'INVITE_REDEEM',
  PASSWORD_SETUP = 'PASSWORD_SETUP',
}

export enum AuditStatus {
  SUCCESS = 'SUCCESS',
  FAILURE = 'FAILURE',
}

export interface AuditLogEntry {
  actor_id: string;
  action: AuditAction;
  target_id?: string;
  status: AuditStatus;
  metadata?: Record<string, any>;
  timestamp: Date;
}

@Injectable()
export class UserAuditService {
  private readonly logger = new Logger(UserAuditService.name);

  /**
   * Log an audit event
   * In a production system, this would write to a database table or external audit log service
   */
  async logEvent(entry: Omit<AuditLogEntry, 'timestamp'>): Promise<void> {
    const auditEntry: AuditLogEntry = {
      ...entry,
      timestamp: new Date(),
    };

    // For now, log to console with structured logging
    // In production, this should write to a database or external audit service
    this.logger.log({
      message: 'Audit event',
      ...auditEntry,
    });
  }

  /**
   * Log a successful user creation
   */
  async logUserCreate(actorId: string, targetUserId: string, metadata?: Record<string, any>): Promise<void> {
    await this.logEvent({
      actor_id: actorId,
      action: AuditAction.USER_CREATE,
      target_id: targetUserId,
      status: AuditStatus.SUCCESS,
      metadata,
    });
  }

  /**
   * Log a failed user creation attempt
   */
  async logUserCreateFailure(actorId: string, reason: string, metadata?: Record<string, any>): Promise<void> {
    await this.logEvent({
      actor_id: actorId,
      action: AuditAction.USER_CREATE,
      status: AuditStatus.FAILURE,
      metadata: { ...metadata, reason },
    });
  }

  /**
   * Log invitation generation
   */
  async logInviteGenerate(actorId: string, targetUserId: string, expiresAt: Date): Promise<void> {
    await this.logEvent({
      actor_id: actorId,
      action: AuditAction.INVITE_GENERATE,
      target_id: targetUserId,
      status: AuditStatus.SUCCESS,
      metadata: { expires_at: expiresAt },
    });
  }

  /**
   * Log invitation regeneration
   */
  async logInviteRegenerate(actorId: string, targetUserId: string, expiresAt: Date): Promise<void> {
    await this.logEvent({
      actor_id: actorId,
      action: AuditAction.INVITE_REGENERATE,
      target_id: targetUserId,
      status: AuditStatus.SUCCESS,
      metadata: { expires_at: expiresAt },
    });
  }

  /**
   * Log invitation redemption (password setup)
   */
  async logInviteRedeem(targetUserId: string): Promise<void> {
    await this.logEvent({
      actor_id: targetUserId, // User is setting their own password
      action: AuditAction.INVITE_REDEEM,
      target_id: targetUserId,
      status: AuditStatus.SUCCESS,
    });
  }

  /**
   * Log password setup completion
   */
  async logPasswordSetup(userId: string): Promise<void> {
    await this.logEvent({
      actor_id: userId,
      action: AuditAction.PASSWORD_SETUP,
      target_id: userId,
      status: AuditStatus.SUCCESS,
    });
  }
}

