import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/database/prisma.service';

export class TestApp {
  app: INestApplication;
  moduleRef: TestingModule;
  prisma: PrismaService;

  async setup() {
    this.moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    this.app = this.moduleRef.createNestApplication();
    this.prisma = this.moduleRef.get<PrismaService>(PrismaService);

    await this.app.init();
  }

  async cleanup() {
    await this.prisma.cleanDatabase();
    await this.app.close();
  }
}
