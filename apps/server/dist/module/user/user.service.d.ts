import { CreateUserDto } from "./dto/create-user.dto";
import { User } from "./entities/user.entity";
import { Repository } from "typeorm";
import { UserResponseDto } from "./dto/response-user.dto";
export declare class UserService {
    private readonly repoUser;
    private readonly logger;
    constructor(repoUser: Repository<User>);
    create(createUserDto: CreateUserDto): Promise<UserResponseDto>;
    findByEmailAndPassword(email: string): Promise<User | null>;
    updateRefeshTokenKey(id: string, refreshToken: string | null): Promise<import("typeorm").UpdateResult>;
    findOneWithRefreshTokenKey(id: string): Promise<User | null>;
    findAll(): string;
    findOne(id: string): Promise<User | null>;
    update(id: number, updateUserDto: string): string;
    remove(id: number): string;
}
