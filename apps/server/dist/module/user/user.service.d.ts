import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { UserResponseDto } from './dto/response-user.dto';
import { UpdateClientProfileDto } from './dto/update-client-profile.dto';
import { FindUsersDto } from './dto/find-users.dto';
import { PaginatedUserDto } from './dto/paginated-user.dto';
export declare class UserService {
    private readonly repoUser;
    private readonly logger;
    constructor(repoUser: Repository<User>);
    create(createUserDto: CreateUserDto): Promise<UserResponseDto>;
    findByEmailAndPassword(email: string): Promise<User | null>;
    updateRefeshTokenKey(id: string, refreshToken: string | null): Promise<import("typeorm").UpdateResult>;
    findOneWithRefreshTokenKey(id: string): Promise<User | null>;
    findAll({ page, search, role, gender, status }: FindUsersDto): Promise<PaginatedUserDto>;
    findOne(id: string): Promise<User | null>;
    findOneForClient(id: string, userId: string): Promise<UserResponseDto>;
    updateClientProfile(userId: string, dto: UpdateClientProfileDto): Promise<UserResponseDto>;
    update(id: number, updateUserDto: string): string;
    remove(userId: string): Promise<void>;
}
