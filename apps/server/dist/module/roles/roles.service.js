"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var RolesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RolesService = void 0;
const common_1 = require("@nestjs/common");
const class_transformer_1 = require("class-transformer");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const role_entity_1 = require("./entities/role.entity");
const roles_enum_1 = require("./enums/roles.enum");
const role_response_dto_1 = require("./dto/role-response.dto");
let RolesService = RolesService_1 = class RolesService {
    roleRepository;
    logger = new common_1.Logger(RolesService_1.name);
    constructor(roleRepository) {
        this.roleRepository = roleRepository;
    }
    async onApplicationBootstrap() {
        const count = await this.roleRepository.count();
        if (count === 0) {
            await this.roleRepository.save([
                {
                    id: roles_enum_1.roleEnum.CLIENT,
                    name: "Khách hàng",
                    description: "Tài khoản mua hàng trên hệ thống",
                },
                {
                    id: roles_enum_1.roleEnum.STAFF_OPERATION,
                    name: "Nhân viên vận hành",
                    description: "Quản lý đơn hàng, vận chuyển, nội dung sản phẩm",
                },
                {
                    id: roles_enum_1.roleEnum.STAFF_WAREHOUSE,
                    name: "Nhân viên kho",
                    description: "Quản lý tồn kho và nhật ký nhập/xuất kho",
                },
                {
                    id: roles_enum_1.roleEnum.ADMIN,
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
        if (roles) {
            throw new common_1.InternalServerErrorException("Can't get all ");
        }
        return (0, class_transformer_1.plainToInstance)(role_response_dto_1.RoleResponseDto, roles, {
            excludeExtraneousValues: true,
        });
    }
    async findOne(id) {
        const role = await this.roleRepository
            .createQueryBuilder()
            .where("id =:id and is_active =:active", { id, active: true })
            .getOne();
        if (!role) {
            throw new common_1.NotFoundException(`Can't find role by ${id}`);
        }
        return (0, class_transformer_1.plainToInstance)(role_response_dto_1.RoleResponseDto, role, {
            excludeExtraneousValues: true,
        });
    }
};
exports.RolesService = RolesService;
exports.RolesService = RolesService = RolesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(role_entity_1.Role)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], RolesService);
//# sourceMappingURL=roles.service.js.map