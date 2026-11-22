import { Test, TestingModule } from '@nestjs/testing';
import { PcCustomerBuildService } from './pc-customer-build.service';

describe('PcCustomerBuildService', () => {
  let service: PcCustomerBuildService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PcCustomerBuildService],
    }).compile();

    service = module.get<PcCustomerBuildService>(PcCustomerBuildService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
