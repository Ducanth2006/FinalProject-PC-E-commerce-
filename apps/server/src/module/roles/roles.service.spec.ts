import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { NotFoundException } from "@nestjs/common";

import { Repository } from "typeorm";
import { RolesService } from "./roles.service";
import { Role } from "./entities/role.entity";
import { roleEnum } from "@/module/roles/enums/roles.enum";
import { RoleResponseDto } from "./dto/role-response.dto";
describe("RolesService", () => {
  let service: RolesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RolesService],
    }).compile();

    service = module.get<RolesService>(RolesService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
