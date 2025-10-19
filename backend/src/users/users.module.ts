import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UsersRepository } from './users.repository';
import { InvitationsRepository } from './invitations.repository';
import { InvitationsService } from './invitations.service';
import { UserAuditService } from './user-audit.service';

@Module({
  controllers: [UsersController],
  providers: [
    UsersService,
    UsersRepository,
    InvitationsRepository,
    InvitationsService,
    UserAuditService,
  ],
  exports: [UsersService, UsersRepository, InvitationsService],
})
export class UsersModule {}
