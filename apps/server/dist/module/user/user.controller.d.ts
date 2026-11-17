import { UserService } from "./user.service";
import { CreateUserDto } from "./dto/create-user.dto";
export declare class UserController {
    private readonly userService;
    constructor(userService: UserService);
    create(createUserDto: CreateUserDto): Promise<import("./dto/response-user.dto").UserResponseDto>;
    findAll(): string;
    findOne(id: string): Promise<import("./entities/user.entity").User | null>;
    update(id: string, updateUserDto: string): string;
    remove(id: string): string;
}
