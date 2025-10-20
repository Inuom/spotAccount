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
import { PaymentsService } from './payments.service';
import { CreateUserPaymentDto, UpdateUserPaymentDto } from './dto/user-payment.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UserPaymentService } from './user-payment.service';
import { PaymentOwnershipGuard } from './payment-ownership.guard';
import { PaymentModificationService } from './payment-modification.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PaymentStatus } from '@prisma/client';

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
    role: string;
  };
}

@Controller('user-payments')
@UseGuards(JwtAuthGuard)
export class UserPaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly userPaymentService: UserPaymentService,
    private readonly paymentModificationService: PaymentModificationService,
  ) {}

  @Post()
  create(@Body() createPaymentDto: CreateUserPaymentDto, @Request() req: AuthenticatedRequest) {
    // Convert to CreatePaymentDto and add user_id
    const createDto: CreatePaymentDto = {
      ...createPaymentDto,
      user_id: req.user.id,
    };
    return this.userPaymentService.createUserPayment(createDto, req.user.id);
  }

  @Get()
  getMyPayments(
    @Request() req: AuthenticatedRequest,
    @Query('status') status?: string,
  ) {
    return this.userPaymentService.getUserPayments(req.user.id, status);
  }

  @Get('pending')
  getPendingPayments(@Request() req: AuthenticatedRequest) {
    return this.userPaymentService.getPendingPayments(req.user.id);
  }

  @Get('history')
  getPaymentHistory(@Request() req: AuthenticatedRequest) {
    return this.userPaymentService.getPaymentHistory(req.user.id);
  }

  @Get('stats')
  getPaymentStats(@Request() req: AuthenticatedRequest) {
    return this.userPaymentService.getUserPaymentStats(req.user.id);
  }

  @Get('suggestions/:amount')
  getSuggestedSchedule(
    @Param('amount') amount: number,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.userPaymentService.getSuggestedSchedule(req.user.id, amount);
  }

  @Get(':id')
  @UseGuards(PaymentOwnershipGuard)
  findOne(@Param('id', ParseUUIDPipe) id: string, @Request() req: AuthenticatedRequest) {
    return this.paymentsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(PaymentOwnershipGuard)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePaymentDto: UpdateUserPaymentDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.paymentModificationService.updateUserPayment(id, updatePaymentDto, req.user.id);
  }

  @Delete(':id')
  @UseGuards(PaymentOwnershipGuard)
  remove(@Param('id', ParseUUIDPipe) id: string, @Request() req: AuthenticatedRequest) {
    return this.paymentModificationService.deleteUserPayment(id, req.user.id);
  }

  @Patch(':id/cancel')
  @UseGuards(PaymentOwnershipGuard)
  cancelPayment(@Param('id', ParseUUIDPipe) id: string, @Request() req: AuthenticatedRequest) {
    return this.paymentModificationService.cancelUserPayment(id, req.user.id);
  }
}
