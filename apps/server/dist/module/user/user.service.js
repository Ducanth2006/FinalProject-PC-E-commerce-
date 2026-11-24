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
const class_validator_1 = require("class-validator");
const user_status_enum_1 = require("./enums/user-status.enum");
const roles_enum_1 = require("../roles/enums/roles.enum");
const role_entity_1 = require("../roles/entities/role.entity");
const require_active_user_1 = require("../../common/utils/require-active-user");
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
                .where('email =:email and is_Active =:active', { email, active: true })
                .getOne();
            if (isExistingEmail) {
                throw new common_1.ConflictException('Email is existing please using another mail');
            }
        }
        if (!password) {
            throw new common_1.BadRequestException('Password must be required');
        }
        const passwordHash = await bcrypt.hash(password, 10);
        const fullName = email.split('@')[0];
        const user = { ...createUserDto, passwordHash, fullName };
        const result = await this.repoUser
            .createQueryBuilder()
            .insert()
            .into(user_entity_1.User)
            .values(user)
            .returning('*')
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
            version: row.version,
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
            .createQueryBuilder('user')
            .select([
            'user.id',
            'user.email',
            'user.fullName',
            'user.passwordHash',
            'user.roleId',
            'user.status',
        ])
            .where('user.email = :email', { email })
            .andWhere('user.isActive = :active', { active: true })
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
            .andWhere('id =:id and is_active = :isActive and status=:status', { id, isActive: true, status: user_status_enum_1.UserStatus.ACTIVE })
            .execute();
    }
    async findOneWithRefreshTokenKey(id) {
        if (!(0, class_validator_1.isUUID)(id)) {
            throw new common_1.BadRequestException('Your ID does not match the UUID format.');
        }
        return await this.repoUser
            .createQueryBuilder('user')
            .select(['user.id', 'user.email', 'user.roleId', 'user.refreshTokenHash'])
            .where('user.id= :id', { id })
            .andWhere('user.isActive =:active and user.status =:status', { active: true, status: user_status_enum_1.UserStatus.ACTIVE })
            .getOne();
    }
    async findAll({ page = 1, search, role, gender, status }) {
        if (!Number.isSafeInteger(page) || page < 1 || page > 214748365) {
            throw new common_1.BadRequestException('page must be a positive integer');
        }
        const query = this.repoUser.createQueryBuilder('user')
            .where('user.isActive = :active', { active: true });
        const term = search?.trim();
        if (term) {
            const escaped = term.replace(/[\\%_]/g, '\\$&');
            query.andWhere(new typeorm_2.Brackets((qb) => {
                qb.where('user.email ILIKE :search', { search: `%${escaped}%` })
                    .orWhere('user.phoneNumber ILIKE :search')
                    .orWhere('user.fullName ILIKE :search');
            }));
        }
        if (role)
            query.andWhere('user.roleId = :role', { role });
        if (gender)
            query.andWhere('user.gender = :gender', { gender });
        if (status)
            query.andWhere("user.status =:status", { status });
        const [users, total] = await query.orderBy('user.createdAt', 'DESC')
            .addOrderBy('user.id', 'DESC').skip((page - 1) * 10).take(10).getManyAndCount();
        return {
            data: (0, class_transformer_1.plainToInstance)(response_user_dto_1.UserResponseDto, users, { excludeExtraneousValues: true }),
            total, page, totalPages: Math.ceil(total / 10),
        };
    }
    async findOne(id) {
        return await this.repoUser
            .createQueryBuilder()
            .where({ id })
            .andWhere('is_active=:is_active and status=:status', { is_active: true, status: user_status_enum_1.UserStatus.ACTIVE })
            .getOne();
    }
    async findOneForClient(id, userId) {
        if (id !== userId)
            throw new common_1.NotFoundException('User not found');
        const user = await this.repoUser.findOne({ where: { id, isActive: true, status: user_status_enum_1.UserStatus.ACTIVE } });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        return (0, class_transformer_1.plainToInstance)(response_user_dto_1.UserResponseDto, user, {
            excludeExtraneousValues: true,
        });
    }
    async updateClientProfile(userId, dto) {
        if (dto.email === null)
            throw new common_1.BadRequestException('Email cannot be null');
        const user = await this.repoUser.findOne({
            where: { id: userId, isActive: true, status: user_status_enum_1.UserStatus.ACTIVE },
        });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        if (dto.email !== undefined && dto.email !== user.email) {
            const existing = await this.repoUser.findOne({
                where: { email: dto.email, id: (0, typeorm_2.Not)(userId) },
                withDeleted: true,
            });
            if (existing)
                throw new common_1.ConflictException('Email is already in use');
        }
        if (dto.phoneNumber != null && dto.phoneNumber !== user.phoneNumber) {
            const existing = await this.repoUser.findOne({
                where: { phoneNumber: dto.phoneNumber, id: (0, typeorm_2.Not)(userId) },
                withDeleted: true,
            });
            if (existing)
                throw new common_1.ConflictException('Phone number is already in use');
        }
        const { email, phoneNumber, fullName, avatarUrl, gender, dateOfBirth } = dto;
        const updated = this.repoUser.create({
            ...user,
            ...(email !== undefined && { email }),
            ...(phoneNumber !== undefined && { phoneNumber }),
            ...(fullName !== undefined && { fullName }),
            ...(avatarUrl !== undefined && { avatarUrl }),
            ...(gender !== undefined && { gender }),
            ...(dateOfBirth !== undefined && {
                dateOfBirth: dateOfBirth === null
                    ? null
                    : new Date(`${dateOfBirth}T00:00:00.000Z`),
            }),
            updatedBy: userId,
        });
        try {
            const saved = await this.repoUser.save(updated);
            return (0, class_transformer_1.plainToInstance)(response_user_dto_1.UserResponseDto, saved, {
                excludeExtraneousValues: true,
            });
        }
        catch (error) {
            if (error &&
                typeof error === 'object' &&
                'code' in error &&
                error.code === '23505') {
                throw new common_1.ConflictException('Email or phone number is already in use');
            }
            throw error;
        }
    }
    async updateAccess(id, actorId, dto) {
        if (!(0, class_validator_1.isUUID)(id))
            throw new common_1.BadRequestException('User ID must be a UUID');
        if (dto.roleId === undefined && dto.status === undefined)
            throw new common_1.BadRequestException('Provide roleId or status');
        const actor = await (0, require_active_user_1.requireActiveUser)(this.repoUser, actorId);
        if (actor.roleId !== roles_enum_1.roleEnum.ADMIN)
            throw new common_1.ForbiddenException('Only administrators can update roles or status');
        return this.repoUser.manager.transaction(async (manager) => {
            const users = manager.getRepository(user_entity_1.User);
            if (dto.roleId !== undefined) {
                const role = await manager.getRepository(role_entity_1.Role).findOne({ where: { id: dto.roleId, isActive: true } });
                if (!role)
                    throw new common_1.NotFoundException('Active role not found');
            }
            const changes = { updatedBy: actorId };
            if (dto.roleId !== undefined)
                changes.roleId = dto.roleId;
            if (dto.status !== undefined)
                changes.status = dto.status;
            if (dto.status === user_status_enum_1.UserStatus.BLOCKED)
                changes.refreshTokenHash = null;
            const result = await users.update({ id, isActive: true, deletedAt: (0, typeorm_2.IsNull)() }, changes);
            if (!result.affected)
                throw new common_1.NotFoundException('User not found');
            const user = await users.findOneByOrFail({ id });
            return (0, class_transformer_1.plainToInstance)(response_user_dto_1.UserResponseDto, user, { excludeExtraneousValues: true });
        });
    }
    async remove(userId) {
        const result = await this.repoUser.update({ id: userId, roleId: roles_enum_1.roleEnum.CLIENT, isActive: true, deletedAt: (0, typeorm_2.IsNull)() }, { isActive: false, deletedAt: () => 'CURRENT_TIMESTAMP', deletedBy: userId, updatedBy: userId, refreshTokenHash: null });
        if (!result.affected)
            throw new common_1.NotFoundException('Account not found or already deleted');
    }
};
exports.UserService = UserService;
exports.UserService = UserService = UserService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], UserService);
//# sourceMappingURL=user.service.js.map