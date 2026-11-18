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
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const role_entity_1 = require("../../roles/entities/role.entity");
const typeorm_1 = require("typeorm");
const typeorm_2 = require("typeorm");
const gender_enum_1 = require("../enums/gender.enum");
const user_status_enum_1 = require("../enums/user-status.enum");
const metaData_entity_1 = require("../../../common/entity/metaData.entity");
let User = class User extends metaData_entity_1.MetaDataEntity {
    id;
    roleId;
    role;
    email;
    phoneNumber;
    passwordHash;
    refreshTokenHash;
    googleId;
    fullName;
    avatarUrl;
    gender;
    dateOfBirth;
    status;
    lastLoginAt;
    version;
};
exports.User = User;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], User.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 50, default: "CLIENT" }),
    __metadata("design:type", String)
], User.prototype, "roleId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => role_entity_1.Role, { onDelete: "RESTRICT" }),
    (0, typeorm_2.JoinColumn)(),
    __metadata("design:type", role_entity_1.Role)
], User.prototype, "role", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 255, unique: true, nullable: true }),
    __metadata("design:type", Object)
], User.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 20, unique: true, nullable: true }),
    __metadata("design:type", Object)
], User.prototype, "phoneNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 255, nullable: true, select: false }),
    __metadata("design:type", Object)
], User.prototype, "passwordHash", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 255, nullable: true, select: false }),
    __metadata("design:type", Object)
], User.prototype, "refreshTokenHash", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 255, unique: true, nullable: true }),
    __metadata("design:type", Object)
], User.prototype, "googleId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 100 }),
    __metadata("design:type", String)
], User.prototype, "fullName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true }),
    __metadata("design:type", Object)
], User.prototype, "avatarUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", enum: gender_enum_1.UserGender, length: 10, nullable: true }),
    __metadata("design:type", Object)
], User.prototype, "gender", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "date", nullable: true }),
    __metadata("design:type", Object)
], User.prototype, "dateOfBirth", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "varchar",
        length: 20,
        enum: user_status_enum_1.UserStatus,
        default: user_status_enum_1.UserStatus.ACTIVE,
    }),
    __metadata("design:type", String)
], User.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "timestamptz", nullable: true }),
    __metadata("design:type", Object)
], User.prototype, "lastLoginAt", void 0);
__decorate([
    (0, typeorm_1.VersionColumn)({ default: 1 }),
    __metadata("design:type", Number)
], User.prototype, "version", void 0);
exports.User = User = __decorate([
    (0, typeorm_1.Entity)("user")
], User);
//# sourceMappingURL=user.entity.js.map