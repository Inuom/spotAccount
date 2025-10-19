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
  ForbiddenException,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentVerificationService } from './payment-verification.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { VerifyPaymentDto } from './dto/verify-payment.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/roles.guard';
import { PaymentStatus } from '@prisma/client';

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
    role: string;
  };
}

@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly paymentVerificationService: PaymentVerificationService,
  ) {}

  @Post()
  create(@Body() createPaymentDto: CreatePaymentDto, @Request() req: AuthenticatedRequest) {
    return this.paymentsService.create(createPaymentDto, req.user.id);
  }

  @Get()
  findAll(
    @Request() req: AuthenticatedRequest,
    @Query('status') status?: PaymentStatus,
    @Query('user_id') user_id?: string,
  ) {
    // If user is not admin, only show their own payments
    const userId = req.user.role === 'ADMIN' ? user_id : req.user.id;
    
    return this.paymentsService.findAll({
      status,
      user_id: userId,
    });
  }

  @Get('pending-verification')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  findPendingVerification() {
    return this.paymentsService.getPendingPaymentsForVerification();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string, @Request() req: AuthenticatedRequest) {
    return this.paymentsService.findOne(id).then(payment => {
      // Users can only view their own payments unless they're admin
      if (payment.user_id !== req.user.id && req.user.role !== 'ADMIN') {
        throw new ForbiddenException('Cannot view payments belonging to other users');
      }
      return payment;
    });
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePaymentDto: UpdatePaymentDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.paymentsService.update(id, updatePaymentDto, req.user.id, req.user.role);
  }

  @Delete(':id')
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.paymentsService.remove(id, req.user.id, req.user.role);
  }

  @Patch(':id/verify')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  verifyPayment(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() verifyPaymentDto: VerifyPaymentDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.paymentsService.verifyPayment(id, verifyPaymentDto, req.user.id);
  }

  @Patch(':id/cancel')
  cancelPayment(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.paymentsService.cancelPayment(id, req.user.id, req.user.role);
  }
}
