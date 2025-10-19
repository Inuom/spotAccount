import { IsString, IsNumber, IsArray, IsEnum, IsOptional, IsDateString, IsUUID, Min, Max, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ShareType } from '@prisma/client';

export class CreateSubscriptionParticipantDto {
  @IsUUID()
  user_id: string;

  @IsEnum(ShareType)
  share_type: ShareType;

  @IsNumber()
  @IsOptional()
  share_value?: number;
}

export class CreateSubscriptionDto {
  @IsString()
  title: string;

  @IsNumber()
  total_amount: number;

  @IsNumber()
  @Min(1)
  @Max(31)
  billing_day: number;

  @IsString()
  @IsOptional()
  frequency?: string = 'monthly';

  @IsDateString()
  @IsOptional()
  start_date?: string;

  @IsDateString()
  @IsOptional()
  end_date?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSubscriptionParticipantDto)
  participants: CreateSubscriptionParticipantDto[];
}
