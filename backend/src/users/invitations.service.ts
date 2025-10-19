import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InvitationsRepository } from './invitations.repository';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';

export interface InvitationResult {
  setup_link: string;
  expires_at: Date;
}

@Injectable()
export class InvitationsService {
  private readonly TOKEN_EXPIRY_HOURS = 48;
  private readonly FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:4200';

  constructor(private invitationsRepository: InvitationsRepository) { }

  /**
   * Generate a new invitation token for a user
   * Invalidates any existing invitation for this user
   */
  async generateInvitation(userId: string): Promise<InvitationResult> {
    // Invalidate any existing invitation
    await this.invitationsRepository.invalidateByUserId(userId);

    // Generate a secure random token
    const token = this.generateSecureToken();
    const tokenHash = await this.hashToken(token);

    // Calculate expiry time
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + this.TOKEN_EXPIRY_HOURS);

    // Store the invitation
    await this.invitationsRepository.create({
      user_id: userId,
      token_hash: tokenHash,
      expires_at: expiresAt,
    });

    // Generate the setup link
    const setupLink = `${this.FRONTEND_URL}/auth/setup-password?token=${token}`;

    return {
      setup_link: setupLink,
      expires_at: expiresAt,
    };
  }

  /**
   * Validate and redeem an invitation token
   * Returns the user ID if valid, throws exception otherwise
   */
  async redeemInvitation(token: string): Promise<string> {
    // Get all pending invitations (not redeemed and not expired)
    const pendingInvitations = await this.invitationsRepository.findPendingInvitations();

    // Try to match the token with each pending invitation
    for (const invitation of pendingInvitations) {
      const isValidToken = await bcrypt.compare(token, invitation.token_hash);
      if (isValidToken) {
        // Check if already redeemed (should not happen due to query but double-check)
        if (invitation.redeemed_at) {
          throw new BadRequestException('This invitation has already been used');
        }

        // Check if expired (should not happen due to query but double-check)
        if (new Date() > invitation.expires_at) {
          throw new BadRequestException('This invitation has expired');
        }

        // Mark as redeemed
        await this.invitationsRepository.markAsRedeemed(invitation.id);

        return invitation.user_id;
      }
    }

    throw new BadRequestException('Invalid or expired invitation token');
  }

  /**
   * Check if a user has a pending (valid, unredeemed) invitation
   */
  async hasPendingInvitation(userId: string): Promise<boolean> {
    const invitation = await this.invitationsRepository.findByUserId(userId);

    if (!invitation || invitation.redeemed_at) {
      return false;
    }

    // Check if expired
    if (new Date() > invitation.expires_at) {
      return false;
    }

    return true;
  }

  /**
   * Get invitation details for a user
   */
  async getInvitationDetails(userId: string): Promise<{ expires_at: Date } | null> {
    const invitation = await this.invitationsRepository.findByUserId(userId);

    if (!invitation || invitation.redeemed_at) {
      return null;
    }

    // Check if expired
    if (new Date() > invitation.expires_at) {
      return null;
    }

    return {
      expires_at: invitation.expires_at,
    };
  }

  /**
   * Clean up expired invitations (can be called by a scheduled job)
   */
  async cleanupExpiredInvitations(): Promise<number> {
    return this.invitationsRepository.deleteExpired();
  }

  /**
   * Generate a cryptographically secure random token
   */
  private generateSecureToken(): string {
    return crypto.randomBytes(32).toString('base64url');
  }

  /**
   * Hash a token using bcrypt for secure storage
   */
  private async hashToken(token: string): Promise<string> {
    return bcrypt.hash(token, 10);
  }
}

