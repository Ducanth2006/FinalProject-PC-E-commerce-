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
exports.UserController = void 0;
const common_1 = require("@nestjs/common");
const user_service_1 = require("./user.service");
const create_user_dto_1 = require("./dto/create-user.dto");
const jwt_auth_guard_1 = require("../auth/guard/jwt-auth.guard");
const swagger_1 = require("@nestjs/swagger");
const update_client_profile_dto_1 = require("./dto/update-client-profile.dto");
const response_user_dto_1 = require("./dto/response-user.dto");
const find_users_dto_1 = require("./dto/find-users.dto");
const api_paginated_response_decorator_1 = require("../../common/decorators/api-paginated-response.decorator");
const roles_guard_1 = require("../../common/guard/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const roles_enum_1 = require("../roles/enums/roles.enum");
const update_user_access_dto_1 = require("./dto/update-user-access.dto");
const active_user_guard_1 = require("../../common/guard/active-user.guard");
let UserController = class UserController {
    userService;
    constructor(userService) {
        this.userService = userService;
    }
    create(createUserDto) {
        return this.userService.create(createUserDto);
    }
    findAll(query) {
        return this.userService.findAll(query);
    }
    findOneForClient(id, req) {
        return this.userService.findOneForClient(id, req.user.userId);
    }
    updateClientProfile(req, dto) {
        return this.userService.updateClientProfile(req.user.userId, dto);
    }
    updateAccess(id, req, dto) {
        return this.userService.updateAccess(id, req.user.userId, dto);
    }
    remove(req) {
        return this.userService.remove(req.user.userId);
    }
};
exports.UserController = UserController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a user' }),
    (0, swagger_1.ApiBody)({ type: create_user_dto_1.CreateUserDto }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'User created successfully.', type: response_user_dto_1.UserResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid user data.' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Email is already in use.' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_user_dto_1.CreateUserDto]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, active_user_guard_1.ActiveUserGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(roles_enum_1.roleEnum.ADMIN),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'List and search users as an administrator (10 per page)' }),
    (0, api_paginated_response_decorator_1.ApiPaginatedResponse)(response_user_dto_1.UserResponseDto),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid search or filter parameters.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Missing or invalid access token.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Administrator role required.' }),
    __param(0, (0, common_1.Query)(new common_1.ValidationPipe({ transform: true, whitelist: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [find_users_dto_1.FindUsersDto]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(":id"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, active_user_guard_1.ActiveUserGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Find a user by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', format: 'uuid' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User found.', type: response_user_dto_1.UserResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid user ID.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Missing or invalid access token.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'User not found.' }),
    __param(0, (0, common_1.Param)("id", common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "findOneForClient", null);
__decorate([
    (0, common_1.Patch)("me"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, active_user_guard_1.ActiveUserGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Update the authenticated user profile' }),
    (0, swagger_1.ApiBody)({ type: update_client_profile_dto_1.UpdateClientProfileDto }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Profile updated successfully.', type: response_user_dto_1.UserResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid profile data.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Missing or invalid access token.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'User not found.' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Email or phone number is already in use.' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, update_client_profile_dto_1.UpdateClientProfileDto]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "updateClientProfile", null);
__decorate([
    (0, common_1.Patch)(':id/access'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, active_user_guard_1.ActiveUserGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(roles_enum_1.roleEnum.ADMIN),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Quản trị viên cập nhật vai trò hoặc trạng thái người dùng' }),
    (0, swagger_1.ApiParam)({ name: 'id', format: 'uuid' }),
    (0, swagger_1.ApiBody)({ type: update_user_access_dto_1.UpdateUserAccessDto }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Cập nhật thành công.', type: response_user_dto_1.UserResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'ID hoặc dữ liệu không hợp lệ.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Token không hợp lệ.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Chỉ admin đang hoạt động được phép thực hiện.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Không tìm thấy người dùng hoặc vai trò.' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, update_user_access_dto_1.UpdateUserAccessDto]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "updateAccess", null);
__decorate([
    (0, common_1.Delete)('me'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, active_user_guard_1.ActiveUserGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(roles_enum_1.roleEnum.CLIENT),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Delete the authenticated client account' }),
    (0, swagger_1.ApiResponse)({ status: 204, description: 'Account deleted successfully.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Missing or invalid access token.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Client role required.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Account not found or already deleted.' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "remove", null);
exports.UserController = UserController = __decorate([
    (0, common_1.Controller)("user"),
    __metadata("design:paramtypes", [user_service_1.UserService])
], UserController);
//# sourceMappingURL=user.controller.js.map