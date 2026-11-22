import { Module } from '@nestjs/common';
import { PcCustomerBuildComponentsService } from './pc-customer-build-components.service';
import { PcCustomerBuildComponentsController } from './pc-customer-build-components.controller';

@Module({
  controllers: [PcCustomerBuildComponentsController],
  providers: [PcCustomerBuildComponentsService],
})
export class PcCustomerBuildComponentsModule {}
