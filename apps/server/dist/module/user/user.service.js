"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var UserService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const user_entity_1 = require("./entities/user.entity");
const typeorm_2 = require("typeorm");
const bcrypt = __importStar(require("bcrypt"));
const class_transformer_1 = require("class-transformer");
const response_user_dto_1 = require("./dto/response-user.dto");
let UserService = UserService_1 = class UserService {
    repoUser;
    logger = new common_1.Logger(UserService_1.name);
    constructor(repoUser) {
        this.repoUser = repoUser;
    }
    async create(createUserDto) {
        const { email, password } = createUserDto;
        if (createUserDto.email) {
            const isExistingEmail = await this.repoUser
                .createQueryBuilder()
                .where("email =:email and is_Active =:active", { email, active: true })
                .getOne();
            if (isExistingEmail) {
                throw new common_1.ConflictException("Email is existing please using another mail");
            }
        }
        if (!password) {
            throw new common_1.BadRequestException("Password must be required");
        }
        const passwordHash = await bcrypt.hash(password, 10);
        const fullName = email.split("@")[0];
        const user = { ...createUserDto, passwordHash, fullName };
        const result = await this.repoUser
            .createQueryBuilder()
            .insert()
            .into(user_entity_1.User)
            .values(user)
            .returning("*")
            .execute();
        const mappedUsers = result.raw.map((row) => ({
            id: row.id,
            roleId: row.role_id,
            email: row.email,
            phoneNumber: row.phone_number,
            googleId: row.google_id,
            fullName: row.full_name,
            avatarUrl: row.avatar_url,
            gender: row.gender,
            dateOfBirth: row.date_of_birth,
            status: row.status,
            lastLoginAt: row.last_login_at,
            isActive: row.is_active,
            createdAt: row.created_at,
            createdBy: row.created_by,
            updatedAt: row.updated_at,
            updatedBy: row.updated_by,
            deletedAt: row.deleted_at,
            deletedBy: row.deleted_by,
        }));
        return (0, class_transformer_1.plainToInstance)(response_user_dto_1.UserResponseDto, mappedUsers, {
            excludeExtraneousValues: true,
        });
    }
    async findByEmailAndPassword(email) {
        return await this.repoUser
            .createQueryBuilder("user")
            .select([
            "user.id",
            "user.email",
            "user.fullName",
            "user.passwordHash",
            "user.roleId",
            "user.status",
        ])
            .where("user.email = :email", { email })
            .andWhere("user.isActive = :active", { active: true })
            .getOne();
    }
    async updateRefeshTokenKey(id, refreshToken) {
        let refreshTokenHash = null;
        if (refreshToken) {
            refreshTokenHash = await bcrypt.hash(refreshToken, 10);
        }
        return await this.repoUser
            .createQueryBuilder()
            .update(user_entity_1.User)
            .set({ refreshTokenHash })
            .andWhere("id =:id and is_active = :isActive", { id, isActive: true })
            .execute();
    }
    findAll() {
        return `This action returns all user`;
    }
    async findOne(id) {
        return await this.repoUser
            .createQueryBuilder()
            .where({ id })
            .andWhere("is_active=:is_active", { is_active: true })
            .getOne();
    }
    update(id, updateUserDto) {
        return `This action updates a #${id} user`;
    }
    remove(id) {
        return `This action removes a #${id} user`;
    }
};
exports.UserService = UserService;
exports.UserService = UserService = UserService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], UserService);
//# sourceMappingURL=user.service.js.map