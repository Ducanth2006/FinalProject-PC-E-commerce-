import { Module } from '@nestjs/common';
import { PcCustomerBuildService } from './pc-customer-build.service';
import { PcCustomerBuildController } from './pc-customer-build.controller';

@Module({
  controllers: [PcCustomerBuildController],
  providers: [PcCustomerBuildService],
})
export class PcCustomerBuildModule {}
