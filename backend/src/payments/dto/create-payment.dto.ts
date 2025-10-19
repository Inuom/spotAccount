import { IsUUID, IsNumber, IsString, IsDateString, IsOptional } from 'class-validator';

export class CreatePaymentDto {
  @IsUUID()
  user_id: string;

  @IsUUID()
  @IsOptional()
  charge_id?: string;

  @IsNumber()
  amount: number;

  @IsString()
  @IsOptional()
  currency?: string = 'EUR';

  @IsDateString()
  scheduled_date: string;
}
