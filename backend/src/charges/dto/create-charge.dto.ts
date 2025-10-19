import { IsUUID, IsDateString, IsNumber, IsOptional, IsEnum } from 'class-validator';
import { ChargeStatus } from '@prisma/client';

export class CreateChargeDto {
  @IsUUID()
  subscription_id: string;

  @IsDateString()
  period_start: string;

  @IsDateString()
  period_end: string;

  @IsNumber()
  amount_total: number;

  @IsEnum(ChargeStatus)
  @IsOptional()
  status?: ChargeStatus = ChargeStatus.PENDING;
}
