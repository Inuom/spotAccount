import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS with configuration
  const corsOrigins = process.env.CORS_ORIGIN 
    ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
    : [
        'http://localhost:4200', 
        'http://127.0.0.1:4200',
        'http://localhost:3000' // For development testing
      ];
  
  console.log('CORS allowed origins:', corsOrigins);
  
  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl requests, or same-origin requests)
      if (!origin) {
        return callback(null, true);
      }
      
      // Check if origin is in allowed list
      if (corsOrigins.includes(origin)) {
        console.log('CORS allowed origin:', origin);
        return callback(null, true);
      }
      
      // For development, be more permissive
      if (process.env.NODE_ENV !== 'production') {
        // Allow localhost with any port in development
        if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
          console.log('CORS development allowed origin:', origin);
          return callback(null, true);
        }
      }
      
      console.error('CORS blocked origin:', origin);
      callback(new Error(`Origin ${origin} not allowed by CORS`), false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type', 
      'Authorization', 
      'Cache-Control',
      'Pragma',
      'Expires',
      'X-Requested-With'
    ],
    optionsSuccessStatus: 200, // Some legacy browsers choke on 204
    preflightContinue: false,
  });
  
  // Global prefix for all routes
  app.setGlobalPrefix('api');
  
  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  
  // Global exception filter
  app.useGlobalFilters(new AllExceptionsFilter());
  
  // Global logging interceptor
  app.useGlobalInterceptors(new LoggingInterceptor());
  
  const port = process.env.PORT || 3000;
  await app.listen(port);
  
  console.log(`Application is running on: http://localhost:${port}/api`);
}

bootstrap();

