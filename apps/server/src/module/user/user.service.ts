import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  UseGuards,
} from "@nestjs/common";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "./entities/user.entity";
import { Repository } from "typeorm";
import * as bcrypt from "bcrypt";
import { plainToInstance } from "class-transformer";
import { UserResponseDto } from "./dto/response-user.dto";
import { JwtAuthGuard } from "../auth/guard/jwt-auth.guard";
import { isUUID } from "class-validator";
@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);
  constructor(
    @InjectRepository(User) private readonly repoUser: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const { email, password } = createUserDto;
    if (createUserDto.email) {
      const isExistingEmail = await this.repoUser
        .createQueryBuilder()
        .where("email =:email and is_Active =:active", { email, active: true })
        .getOne();
      if (isExistingEmail) {
        throw new ConflictException(
          "Email is existing please using another mail",
        );
      }
    }
    if (!password) {
      throw new BadRequestException("Password must be required");
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const fullName = email.split("@")[0];
    const user = { ...createUserDto, passwordHash, fullName };
    const result = await this.repoUser
      .createQueryBuilder()
      .insert()
      .into(User)
      .values(user)
      .returning("*")
      .execute();
    const mappedUsers = result.raw.map((row: any) => ({
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

      // Metadata fields
      isActive: row.is_active,
      createdAt: row.created_at,
      createdBy: row.created_by,
      updatedAt: row.updated_at,
      updatedBy: row.updated_by,
      deletedAt: row.deleted_at,
      deletedBy: row.deleted_by,
    }));
    return plainToInstance(UserResponseDto, mappedUsers, {
      excludeExtraneousValues: true,
    });
  }

  async findByEmailAndPassword(email: string) {
    return await this.repoUser
      .createQueryBuilder("user") // must be required when using select
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
  async updateRefeshTokenKey(id: string, refreshToken: string) {
    let refreshTokenHash = null;
    if (refreshToken) {
      refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    }
    return await this.repoUser
      .createQueryBuilder()
      .update(User)
      .set({ refreshTokenHash })
      .andWhere("id =:id and is_active = :isActive", { id, isActive: true })
      .execute();
  }
  async findOneWithRefreshTokenKey(id: string) {
    if (!isUUID(id)) {
      throw new BadRequestException("Your ID does not match the UUID format.");
    }
    return await this.repoUser
      .createQueryBuilder("user")
      .select(["user.id", "user.email", "user.roleId", "user.refreshTokenHash"])
      .where("user.id= :id", { id })
      .andWhere("user.isActive =:active", { active: true })
      .getOne();
  }

  findAll() {
    return `This action returns all user`;
  }

  async findOne(id: string) {
    return await this.repoUser
      .createQueryBuilder()
      .where({ id })
      .andWhere("is_active=:is_active", { is_active: true })
      .getOne();
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
