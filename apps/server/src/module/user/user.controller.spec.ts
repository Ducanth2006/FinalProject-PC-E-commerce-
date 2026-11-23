import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { GUARDS_METADATA } from '@nestjs/common/constants';
import { ActiveUserGuard } from '@/common/guard/active-user.guard';

describe('UserController', () => {
  let controller: UserController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [{ provide: UserService, useValue: {} }, { provide: getRepositoryToken(User), useValue: {} }],
    }).compile();

    controller = module.get<UserController>(UserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('checks the active user on every authenticated endpoint, not public registration', () => {
    for (const handler of [controller.findAll, controller.findOneForClient, controller.updateClientProfile, controller.updateAccess, controller.remove]) {
      expect(Reflect.getMetadata(GUARDS_METADATA, handler)).toContain(ActiveUserGuard);
    }
    expect(Reflect.getMetadata(GUARDS_METADATA, controller.create) ?? []).not.toContain(ActiveUserGuard);
  });
});
