import { UserService } from "./user.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { AuthenticatedUser } from "../../common/types/authenticated-user.type";
import { UpdateClientProfileDto } from './dto/update-client-profile.dto';
import { UserResponseDto } from './dto/response-user.dto';
import { FindUsersDto } from './dto/find-users.dto';
import { PaginatedUserDto } from './dto/paginated-user.dto';
export declare class UserController {
    private readonly userService;
    constructor(userService: UserService);
    create(createUserDto: CreateUserDto): Promise<UserResponseDto>;
    findAll(query: FindUsersDto): Promise<PaginatedUserDto>;
    findOneForClient(id: string, req: AuthenticatedUser): Promise<UserResponseDto>;
    updateClientProfile(req: AuthenticatedUser, dto: UpdateClientProfileDto): Promise<UserResponseDto>;
    remove(req: AuthenticatedUser): Promise<void>;
}
