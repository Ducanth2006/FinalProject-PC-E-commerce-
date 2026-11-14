import { RolesService } from './roles.service';
import { BaseErrorDto } from "../../common/dto/base-dtoError.dto";
import { RoleResponseDto } from './dto/role-response.dto.js';
declare const RoleNotFoundDto_base: import("@nestjs/common").Type<Partial<BaseErrorDto>>;
export declare class RoleNotFoundDto extends RoleNotFoundDto_base {
    message: string;
}
export declare class RolesController {
    private readonly rolesService;
    constructor(rolesService: RolesService);
    findAll(): Promise<RoleResponseDto[]>;
    findOne(id: string): Promise<RoleResponseDto>;
}
export {};
