import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { ROLES_KEY } from '@/common/decorators/roles.decorator';
import { roleEnum } from '@/module/roles/enums/roles.enum';

describe('CategoriesController', () => {
  let controller: CategoriesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoriesController],
      providers: [{ provide: CategoriesService, useValue: {} }],
    }).compile();

    controller = module.get<CategoriesController>(CategoriesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('restricts creation to administrators and operations staff', () => {
    expect(Reflect.getMetadata(ROLES_KEY, controller.create)).toEqual([roleEnum.ADMIN, roleEnum.STAFF_OPERATION]);
  });

  it('restricts bulk creation to administrators and operations staff', () => {
    expect(Reflect.getMetadata(ROLES_KEY, controller.createBulk)).toEqual([roleEnum.ADMIN, roleEnum.STAFF_OPERATION]);
  });

  it('restricts updates to administrators and operations staff', () => {
    expect(Reflect.getMetadata(ROLES_KEY, controller.update)).toEqual([roleEnum.ADMIN, roleEnum.STAFF_OPERATION]);
  });

  it('restricts deletion to administrators and operations staff', () => {
    expect(Reflect.getMetadata(ROLES_KEY, controller.remove)).toEqual([roleEnum.ADMIN, roleEnum.STAFF_OPERATION]);
  });
});
