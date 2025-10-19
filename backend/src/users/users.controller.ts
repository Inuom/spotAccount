import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseUUIDPipe,
  Request,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { CreateUserByAdminDto } from './dto/create-user-by-admin.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role as PrismaRole } from '@prisma/client';
import { Role } from '../auth/roles.guard';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  /**
   * Create a user by admin with invitation link (no password required)
   */
  @Post('create-with-invitation')
  async createWithInvitation(
    @Body() createUserDto: CreateUserByAdminDto,
    @Request() req: any,
  ) {
    const actorId = req.user.userId;
    return this.usersService.createUserWithInvitation(createUserDto, actorId);
  }

  @Get()
  findAll(
    @Query('role') role?: PrismaRole,
    @Query('is_active') is_active?: boolean,
  ) {
    const isActiveBoolean = is_active !== undefined ? is_active === true : undefined;
    return this.usersService.findAll(role, isActiveBoolean);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.remove(id);
  }

  /**
   * Regenerate invitation link for a user
   */
  @Post(':id/invitation')
  async regenerateInvitation(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: any,
  ) {
    const actorId = req.user.userId;
    return this.usersService.regenerateInvitation(id, actorId);
  }

  /**
   * Get invitation details for a user
   */
  @Get(':id/invitation')
  async getInvitationDetails(@Param('id', ParseUUIDPipe) id: string) {
    const invitation = await this.usersService.getInvitationDetails(id);
    if (!invitation) {
      return { has_pending_invitation: false };
    }
    return {
      has_pending_invitation: true,
      expires_at: invitation.expires_at,
    };
  }
}
