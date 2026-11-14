import { OnApplicationBootstrap } from "@nestjs/common";
import { Repository } from "typeorm";
import { Role } from "./entities/role.entity";
import { RoleResponseDto } from "./dto/role-response.dto";
export declare class RolesService implements OnApplicationBootstrap {
    private readonly roleRepository;
    private readonly logger;
    constructor(roleRepository: Repository<Role>);
    onApplicationBootstrap(): Promise<void>;
    findAll(): Promise<RoleResponseDto[]>;
    findOne(id: string): Promise<RoleResponseDto>;
}
