import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
  Request,
} from '@nestjs/common';
import { ChargesService } from './charges.service';
import { CreateChargeDto } from './dto/create-charge.dto';
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

@Controller('charges')
@UseGuards(JwtAuthGuard)
export class ChargesController {
  constructor(private readonly chargesService: ChargesService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  create(@Body() createChargeDto: CreateChargeDto) {
    return this.chargesService.create(createChargeDto);
  }

  @Get()
  findAll(
    @Query('subscription_id') subscriptionId?: string,
    @Query('date') date?: string,
  ) {
    return this.chargesService.findAll(subscriptionId, date);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.chargesService.findOne(id);
  }

  @Get(':id/shares')
  getChargeShares(@Param('id', ParseUUIDPipe) id: string) {
    return this.chargesService.getChargeShares(id);
  }

  @Post('subscriptions/:id/generate')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  generateChargesForSubscription(
    @Param('id', ParseUUIDPipe) subscriptionId: string,
    @Query('until') until: string,
  ) {
    const untilDate = new Date(until);
    return this.chargesService.generateChargesForSubscription(subscriptionId, untilDate);
  }
}
