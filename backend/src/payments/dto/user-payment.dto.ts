import { IsUUID, IsNumber, IsString, IsDateString, IsOptional, Min } from 'class-validator';

export class CreateUserPaymentDto {
  @IsUUID()
  @IsOptional()
  charge_id?: string;

  @IsNumber()
  @Min(0.01, { message: 'Payment amount must be greater than 0' })
  amount: number;

  @IsString()
  @IsOptional()
  currency?: string = 'EUR';

  @IsDateString()
  scheduled_date: string;
}

export class UpdateUserPaymentDto {
  @IsNumber()
  @IsOptional()
  @Min(0.01, { message: 'Payment amount must be greater than 0' })
  amount?: number;

  @IsDateString()
  @IsOptional()
  scheduled_date?: string;
}
