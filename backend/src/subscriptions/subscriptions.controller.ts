import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseUUIDPipe,
  Request,
} from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { AddParticipantDto } from './dto/add-participant.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/roles.guard';

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
    role: string;
  };
}

@Controller('subscriptions')
@UseGuards(JwtAuthGuard)
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  create(@Body() createSubscriptionDto: CreateSubscriptionDto, @Request() req: AuthenticatedRequest) {
    return this.subscriptionsService.create(createSubscriptionDto, req.user.id);
  }

  @Get()
  findAll() {
    return this.subscriptionsService.findAll();
  }

  @Get('my-subscriptions')
  findUserSubscriptions(@Request() req: AuthenticatedRequest) {
    return this.subscriptionsService.findUserSubscriptions(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.subscriptionsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateSubscriptionDto: UpdateSubscriptionDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.subscriptionsService.update(id, updateSubscriptionDto, req.user.id);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  remove(@Param('id', ParseUUIDPipe) id: string, @Request() req: AuthenticatedRequest) {
    return this.subscriptionsService.remove(id, req.user.id);
  }

  @Post(':id/participants')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  addParticipant(
    @Param('id', ParseUUIDPipe) subscriptionId: string,
    @Body() addParticipantDto: AddParticipantDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.subscriptionsService.addParticipant(subscriptionId, addParticipantDto, req.user.id);
  }
}
