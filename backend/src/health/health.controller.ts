import { Controller, Get, HttpStatus, HttpException } from '@nestjs/common';
import { Public } from '../auth/decorators/public.decorator';
import { PrismaService } from '../database/prisma.service';
import { LoggerService } from '../common/logger.service';

@Controller('health')
export class HealthController {
  private readonly logger: LoggerService;

  constructor(private readonly prisma: PrismaService) {
    this.logger = new LoggerService('HealthController');
  }

  @Get()
  @Public()
  async check() {
    const checks = await this.performHealthChecks();
    const isHealthy = checks.database === 'up';
    
    return {
      status: isHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
      services: checks,
    };
  }

  @Get('db')
  @Public()
  async checkDatabase() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return {
        status: 'ok',
        database: 'connected',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'error',
        database: 'disconnected',
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Get('healthz')
  @Public()
  async healthz() {
    try {
      // Perform comprehensive health check
      const checks = await this.performHealthChecks();
      const isHealthy = checks.database === 'up';
      
      if (!isHealthy) {
        throw new HttpException(
          {
            status: 'unhealthy',
            errors: ['Database connection failed'],
            timestamp: new Date().toISOString(),
          },
          HttpStatus.SERVICE_UNAVAILABLE,
        );
      }

      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new HttpException(
        {
          status: 'unhealthy',
          errors: [error.message],
          timestamp: new Date().toISOString(),
        },
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  @Get('ready')
  @Public()
  async readiness() {
    // Readiness check - is the service ready to accept traffic?
    const checks = await this.performHealthChecks();
    const isReady = checks.database === 'up';
    
    if (!isReady) {
      throw new HttpException(
        {
          status: 'not ready',
          timestamp: new Date().toISOString(),
          services: checks,
        },
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
    
    return {
      status: 'ready',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('live')
  @Public()
  async liveness() {
    // Liveness check - is the service alive?
    return {
      status: 'alive',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }

  private async performHealthChecks() {
    // Check database connection
    let databaseStatus = 'down';
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      databaseStatus = 'up';
    } catch (error) {
      this.logger.error('Database health check failed', error.message, {
        error: error.stack,
      });
    }

    return {
      database: databaseStatus,
      aws: 'up', // Placeholder for AWS service checks
      github: 'up', // Placeholder for GitHub integration checks
    };
  }
}

