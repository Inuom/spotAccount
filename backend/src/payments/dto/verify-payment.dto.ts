import { IsString, IsOptional } from 'class-validator';

export class VerifyPaymentDto {
  @IsString()
  @IsOptional()
  verification_reference?: string;
}
