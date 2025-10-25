import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';

export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
}

export interface LogContext {
  correlationId?: string;
  userId?: string;
  requestId?: string;
  [key: string]: any;
}

@Injectable()
export class LoggerService implements NestLoggerService {
  private context: string;
  private readonly isProduction: boolean;

  constructor(context?: string) {
    this.context = context || 'Application';
    this.isProduction = process.env.NODE_ENV === 'production';
  }

  /**
   * Log an informational message
   */
  log(message: string, context?: LogContext): void {
    this.writeLog(LogLevel.INFO, message, context);
  }

  /**
   * Log an error message
   */
  error(message: string, trace?: string, context?: LogContext): void {
    this.writeLog(LogLevel.ERROR, message, { ...context, trace });
  }

  /**
   * Log a warning message
   */
  warn(message: string, context?: LogContext): void {
    this.writeLog(LogLevel.WARN, message, context);
  }

  /**
   * Log a debug message (only in development)
   */
  debug(message: string, context?: LogContext): void {
    if (!this.isProduction) {
      this.writeLog(LogLevel.DEBUG, message, context);
    }
  }

  /**
   * Log verbose information (alias for debug)
   */
  verbose(message: string, context?: LogContext): void {
    this.debug(message, context);
  }

  /**
   * Log HTTP request
   */
  logRequest(
    method: string,
    url: string,
    statusCode: number,
    responseTime: number,
    context?: LogContext,
  ): void {
    const message = `${method} ${url} ${statusCode} ${responseTime}ms`;
    this.log(message, {
      ...context,
      method,
      url,
      statusCode,
      responseTime,
      type: 'http-request',
    });
  }

  /**
   * Log database query
   */
  logQuery(query: string, duration: number, context?: LogContext): void {
    this.debug(`DB Query: ${query} (${duration}ms)`, {
      ...context,
      query,
      duration,
      type: 'database-query',
    });
  }

  /**
   * Log business event
   */
  logEvent(event: string, data?: any, context?: LogContext): void {
    this.log(`Event: ${event}`, {
      ...context,
      event,
      data,
      type: 'business-event',
    });
  }

  /**
   * Log security event
   */
  logSecurity(event: string, severity: 'low' | 'medium' | 'high' | 'critical', context?: LogContext): void {
    const level = severity === 'low' || severity === 'medium' ? LogLevel.WARN : LogLevel.ERROR;
    this.writeLog(level, `Security: ${event}`, {
      ...context,
      event,
      severity,
      type: 'security',
    });
  }

  /**
   * Log performance metric
   */
  logPerformance(operation: string, duration: number, context?: LogContext): void {
    this.debug(`Performance: ${operation} took ${duration}ms`, {
      ...context,
      operation,
      duration,
      type: 'performance',
    });
  }

  /**
   * Write log entry
   */
  private writeLog(level: LogLevel, message: string, context?: LogContext): void {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      context: this.context,
      message,
      ...context,
    };

    // In production, output structured JSON logs
    if (this.isProduction) {
      console.log(JSON.stringify(logEntry));
    } else {
      // In development, output human-readable logs
      const colorCode = this.getColorCode(level);
      const resetCode = '\x1b[0m';
      const contextStr = context ? ` ${JSON.stringify(context)}` : '';
      console.log(
        `${colorCode}[${timestamp}] [${level.toUpperCase()}] [${this.context}]${resetCode} ${message}${contextStr}`,
      );
    }
  }

  /**
   * Get ANSI color code for log level
   */
  private getColorCode(level: LogLevel): string {
    switch (level) {
      case LogLevel.ERROR:
        return '\x1b[31m'; // Red
      case LogLevel.WARN:
        return '\x1b[33m'; // Yellow
      case LogLevel.INFO:
        return '\x1b[36m'; // Cyan
      case LogLevel.DEBUG:
        return '\x1b[35m'; // Magenta
      default:
        return '\x1b[0m'; // Reset
    }
  }

  /**
   * Create a child logger with additional context
   */
  child(childContext: string): LoggerService {
    const childLogger = new LoggerService(`${this.context}:${childContext}`);
    return childLogger;
  }

  /**
   * Set context for the logger
   */
  setContext(context: string): void {
    this.context = context;
  }
}

/**
 * Global logger instance
 */
export const logger = new LoggerService('Global');

