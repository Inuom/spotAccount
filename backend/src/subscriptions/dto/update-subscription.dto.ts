import { IsString, IsNumber, IsBoolean, IsOptional, Min, Max } from 'class-validator';

export class UpdateSubscriptionDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsNumber()
  @IsOptional()
  total_amount?: number;

  @IsNumber()
  @Min(1)
  @Max(31)
  @IsOptional()
  billing_day?: number;

  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
}
