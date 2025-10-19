import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService, LoginDto } from './auth.service';
import { PasswordUpdateService } from './password-update.service';
import { UpdatePasswordDto, UpdatePasswordResponseDto } from './dto/update-password.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { Public } from './decorators/public.decorator';

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
    role: string;
  };
}

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly passwordUpdateService: PasswordUpdateService,
  ) {}

  /**
   * Login endpoint - public
   */
  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  /**
   * Update password endpoint - requires authentication
   */
  @UseGuards(JwtAuthGuard)
  @Post('update-password')
  @HttpCode(HttpStatus.OK)
  async updatePassword(
    @Body() updatePasswordDto: UpdatePasswordDto,
    @Request() req: AuthenticatedRequest,
  ): Promise<UpdatePasswordResponseDto> {
    await this.passwordUpdateService.updatePassword(
      req.user.id,
      updatePasswordDto.currentPassword,
      updatePasswordDto.newPassword,
    );

    return {
      message: 'Password updated successfully',
    };
  }

  /**
   * Re-authentication endpoint - validates current password
   * Used before sensitive operations
   */
  @UseGuards(JwtAuthGuard)
  @Post('re-authenticate')
  @HttpCode(HttpStatus.OK)
  async reAuthenticate(
    @Body('password') password: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<{ authenticated: boolean }> {
    const isAuthenticated = await this.authService.reAuthenticate(
      req.user.id,
      password,
    );

    return { authenticated: isAuthenticated };
  }
}

