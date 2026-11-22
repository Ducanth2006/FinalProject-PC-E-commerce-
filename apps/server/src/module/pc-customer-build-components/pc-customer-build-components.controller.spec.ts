import { Test, TestingModule } from '@nestjs/testing';
import { PcCustomerBuildComponentsController } from './pc-customer-build-components.controller';
import { PcCustomerBuildComponentsService } from './pc-customer-build-components.service';

describe('PcCustomerBuildComponentsController', () => {
  let controller: PcCustomerBuildComponentsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PcCustomerBuildComponentsController],
      providers: [PcCustomerBuildComponentsService],
    }).compile();

    controller = module.get<PcCustomerBuildComponentsController>(PcCustomerBuildComponentsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
