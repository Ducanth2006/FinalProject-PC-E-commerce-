import { Injectable, OnApplicationBootstrap, Logger, NotFoundException,InternalServerErrorException } from "@nestjs/common";
import { plainToInstance } from "class-transformer";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { Role } from "./entities/role.entity";
import { roleEnum } from "@/module/roles/enums/roles.enum";
import { RoleResponseDto } from "./dto/role-response.dto";
@Injectable()
export class RolesService implements OnApplicationBootstrap {
  private readonly logger = new Logger(RolesService.name);

  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}
  // Synchornize other device when pulled
  async onApplicationBootstrap() {
    const count = await this.roleRepository.count();

    if (count === 0) {
      await this.roleRepository.save([
        {
          id: roleEnum.CLIENT,
          name: "Khách hàng",
          description: "Tài khoản mua hàng trên hệ thống",
        },
        {
          id: roleEnum.STAFF_OPERATION,
          name: "Nhân viên vận hành",
          description: "Quản lý đơn hàng, vận chuyển, nội dung sản phẩm",
        },
        {
          id: roleEnum.STAFF_WAREHOUSE,
          name: "Nhân viên kho",
          description: "Quản lý tồn kho và nhật ký nhập/xuất kho",
        },
        {
          id: roleEnum.ADMIN,
          name: "Quản trị viên",
          description: "Toàn quyền quản trị hệ thống",
        },
      ]);
      this.logger.log("Intialized data roles ");
    }
  }

  async findAll() {
    const roles = await this.roleRepository
      .createQueryBuilder()
      .where("is_active =:active", { active: true })
      .getMany();
    if(roles){
      throw new InternalServerErrorException("Can't get all ")
    }
    return plainToInstance(RoleResponseDto, roles, {
      excludeExtraneousValues: true,
    });
  }

  async findOne(id: string) {
    const role = await this.roleRepository
      .createQueryBuilder()
      .where("id =:id and is_active =:active", { id, active: true })
      .getOne();
    if(!role){
      throw new NotFoundException(`Can't find role by ${id}`)
    }
    return plainToInstance(RoleResponseDto, role, {
      excludeExtraneousValues: true,
    });
  }
}
