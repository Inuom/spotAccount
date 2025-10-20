import {
  Controller,
  Get,
  Query,
  UseGuards,
  Param,
  ParseUUIDPipe,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ReportService } from './report.service';
import { BalanceService } from './balance.service';

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
    role: string;
  };
}

@Controller('reports')
@UseGuards(JwtAuthGuard)
export class ReportsController {
  constructor(
    private reportService: ReportService,
    private balanceService: BalanceService,
  ) {}

  /**
   * Get user balance report
   * GET /reports/balance/user/:userId?asOfDate=2024-01-01
   */
  @Get('balance/user/:userId')
  async getUserBalance(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Query('asOfDate') asOfDate?: string,
  ) {
    const date = asOfDate ? new Date(asOfDate) : undefined;
    return this.reportService.generateUserBalanceReport(userId, date);
  }

  /**
   * Get subscription balance report
   * GET /reports/balance/subscription/:subscriptionId?asOfDate=2024-01-01
   */
  @Get('balance/subscription/:subscriptionId')
  async getSubscriptionBalance(
    @Param('subscriptionId', ParseUUIDPipe) subscriptionId: string,
    @Query('asOfDate') asOfDate?: string,
  ) {
    const date = asOfDate ? new Date(asOfDate) : undefined;
    return this.reportService.generateSubscriptionBalanceReport(
      subscriptionId,
      date,
    );
  }

  /**
   * Get all balances report
   * GET /reports/balance/all?asOfDate=2024-01-01
   */
  @Get('balance/all')
  async getAllBalances(@Query('asOfDate') asOfDate?: string) {
    const date = asOfDate ? new Date(asOfDate) : undefined;
    return this.reportService.generateAllBalancesReport(date);
  }

  /**
   * Get current user balance
   * GET /reports/balance/me?asOfDate=2024-01-01
   */
  @Get('balance/me')
  async getMyBalance(
    @Request() req: AuthenticatedRequest,
    @Query('asOfDate') asOfDate?: string,
  ) {
    const userId = req.user.id;
    const date = asOfDate ? new Date(asOfDate) : undefined;
    return this.reportService.generateUserBalanceReport(userId, date);
  }
}

