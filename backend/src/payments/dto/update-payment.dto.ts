import { IsNumber, IsDateString, IsOptional } from 'class-validator';

export class UpdatePaymentDto {
  @IsNumber()
  @IsOptional()
  amount?: number;

  @IsDateString()
  @IsOptional()
  scheduled_date?: string;
}
