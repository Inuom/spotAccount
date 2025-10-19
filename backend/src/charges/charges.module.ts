import { Module } from '@nestjs/common';
import { ChargesService } from './charges.service';
import { ChargesController } from './charges.controller';
import { ChargesRepository } from './charges.repository';
import { ChargeSharesService } from './charge-shares.service';

@Module({
  controllers: [ChargesController],
  providers: [ChargesService, ChargesRepository, ChargeSharesService],
  exports: [ChargesService, ChargesRepository, ChargeSharesService],
})
export class ChargesModule {}
