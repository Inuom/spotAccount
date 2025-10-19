import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PasswordUpdateService } from './password-update.service';
import { PasswordVerificationService } from './password-verification.service';
import { PasswordValidationService } from './password-validation.service';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [
    DatabaseModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET') || 'your-secret-key-change-in-production',
        signOptions: {
          expiresIn: configService.get('JWT_EXPIRATION') || '24h',
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    JwtStrategy,
    AuthService,
    PasswordUpdateService,
    PasswordVerificationService,
    PasswordValidationService,
  ],
  exports: [
    JwtModule,
    PassportModule,
    AuthService,
    PasswordVerificationService,
    PasswordValidationService,
  ],
})
export class AuthModule {}

