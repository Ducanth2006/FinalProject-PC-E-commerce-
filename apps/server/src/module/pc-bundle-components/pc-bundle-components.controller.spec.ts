import { Test, TestingModule } from '@nestjs/testing';
import { PcBundleComponentsController } from './pc-bundle-components.controller';
import { PcBundleComponentsService } from './pc-bundle-components.service';

describe('PcBundleComponentsController', () => {
  let controller: PcBundleComponentsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PcBundleComponentsController],
      providers: [PcBundleComponentsService],
    }).compile();

    controller = module.get<PcBundleComponentsController>(PcBundleComponentsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
