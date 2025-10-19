import { IsEmail, IsString, IsEnum, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';
import { Role } from '@prisma/client';

export class CreateUserByAdminDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(Role)
  @IsOptional()
  role?: Role;

  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
}

