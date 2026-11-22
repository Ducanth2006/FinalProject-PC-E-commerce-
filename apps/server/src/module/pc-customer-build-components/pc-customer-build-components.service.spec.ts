import { Test, TestingModule } from '@nestjs/testing';
import { PcCustomerBuildComponentsService } from './pc-customer-build-components.service';

describe('PcCustomerBuildComponentsService', () => {
  let service: PcCustomerBuildComponentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PcCustomerBuildComponentsService],
    }).compile();

    service = module.get<PcCustomerBuildComponentsService>(PcCustomerBuildComponentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
