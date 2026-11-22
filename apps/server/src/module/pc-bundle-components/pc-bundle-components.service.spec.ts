import { Test, TestingModule } from '@nestjs/testing';
import { PcBundleComponentsService } from './pc-bundle-components.service';

describe('PcBundleComponentsService', () => {
  let service: PcBundleComponentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PcBundleComponentsService],
    }).compile();

    service = module.get<PcBundleComponentsService>(PcBundleComponentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
