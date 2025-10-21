import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from './app.module';
import { PrismaService } from './database/prisma.service';

describe('AppModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [AppModule],
    })
    .overrideProvider(PrismaService)
    .useValue({
      $queryRaw: jest.fn(),
      user: { findUnique: jest.fn(), create: jest.fn(), update: jest.fn() },
      subscription: { findMany: jest.fn(), create: jest.fn() },
      charge: { findMany: jest.fn(), create: jest.fn() },
      payment: { findMany: jest.fn(), create: jest.fn() },
    })
    .compile();
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  it('should compile successfully', () => {
    expect(module).toBeDefined();
  });
});
