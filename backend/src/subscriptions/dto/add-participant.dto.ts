import { IsString, IsEnum, IsOptional, IsNumber, IsUUID } from 'class-validator';
import { ShareType } from '@prisma/client';

export class AddParticipantDto {
  @IsUUID()
  user_id: string;

  @IsEnum(ShareType)
  share_type: ShareType;

  @IsNumber()
  @IsOptional()
  share_value?: number;
}
