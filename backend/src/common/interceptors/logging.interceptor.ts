import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LoggerService } from '../logger.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger: LoggerService;

  constructor() {
    this.logger = new LoggerService('HTTP');
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, user, headers } = request;
    const now = Date.now();
    const correlationId = headers['x-correlation-id'] || this.generateCorrelationId();

    return next.handle().pipe(
      tap(() => {
        const response = context.switchToHttp().getResponse();
        const responseTime = Date.now() - now;
        
        this.logger.logRequest(method, url, response.statusCode, responseTime, {
          correlationId,
          userId: user?.id,
          userAgent: headers['user-agent'],
        });
      }),
    );
  }

  private generateCorrelationId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

