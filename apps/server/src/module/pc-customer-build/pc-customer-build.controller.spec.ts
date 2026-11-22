import { Test, TestingModule } from '@nestjs/testing';
import { PcCustomerBuildController } from './pc-customer-build.controller';
import { PcCustomerBuildService } from './pc-customer-build.service';

describe('PcCustomerBuildController', () => {
  let controller: PcCustomerBuildController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PcCustomerBuildController],
      providers: [PcCustomerBuildService],
    }).compile();

    controller = module.get<PcCustomerBuildController>(PcCustomerBuildController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
