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
Object.defineProperty(exports, "__esModule", { value: true });
exports.RolesController = exports.RoleNotFoundDto = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const swagger_2 = require("@nestjs/swagger");
const roles_service_1 = require("./roles.service");
const base_dtoError_dto_1 = require("../../common/dto/base-dtoError.dto");
const role_response_dto_js_1 = require("./dto/role-response.dto.js");
class RoleNotFoundDto extends (0, swagger_2.PartialType)(base_dtoError_dto_1.BaseErrorDto) {
    message;
}
exports.RoleNotFoundDto = RoleNotFoundDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Role không tồn tại' }),
    __metadata("design:type", String)
], RoleNotFoundDto.prototype, "message", void 0);
let RolesController = class RolesController {
    rolesService;
    constructor(rolesService) {
        this.rolesService = rolesService;
    }
    findAll() {
        return this.rolesService.findAll();
    }
    findOne(id) {
        return this.rolesService.findOne(id);
    }
};
exports.RolesController = RolesController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Get all roles',
        description: 'Get all roles',
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Get roles successfully ',
        type: [role_response_dto_js_1.RoleResponseDto],
    }),
    (0, swagger_1.ApiBadRequestResponse)({
        description: "Can't find roles ",
        type: RoleNotFoundDto,
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], RolesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get role by id ' }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        type: String,
        description: 'Id',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, swagger_1.ApiOkResponse)({
        description: "Get Role by id successfully  ",
        type: role_response_dto_js_1.RoleResponseDto,
    }),
    (0, swagger_1.ApiNotFoundResponse)({
        description: "Can't find role by id ",
        type: RoleNotFoundDto,
    }),
    (0, swagger_1.ApiBadRequestResponse)({
        description: 'ID must be String',
        type: RoleNotFoundDto,
    }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RolesController.prototype, "findOne", null);
exports.RolesController = RolesController = __decorate([
    (0, common_1.Controller)('roles'),
    __metadata("design:paramtypes", [roles_service_1.RolesService])
], RolesController);
//# sourceMappingURL=roles.controller.js.map