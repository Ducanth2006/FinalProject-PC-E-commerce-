import { UserService } from "./user.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { AuthenticatedUser } from "../../common/types/authenticated-user.type";
import { UpdateClientProfileDto } from './dto/update-client-profile.dto';
import { UserResponseDto } from './dto/response-user.dto';
import { FindUsersDto } from './dto/find-users.dto';
import { UpdateUserAccessDto } from './dto/update-user-access.dto';
export declare class UserController {
    private readonly userService;
    constructor(userService: UserService);
    create(createUserDto: CreateUserDto): Promise<UserResponseDto>;
    findAll(query: FindUsersDto): Promise<import("../../common/types/paginationResponse.type").PaginatedResponse<UserResponseDto>>;
    findOneForClient(id: string, req: AuthenticatedUser): Promise<UserResponseDto>;
    updateClientProfile(req: AuthenticatedUser, dto: UpdateClientProfileDto): Promise<UserResponseDto>;
    updateAccess(id: string, req: AuthenticatedUser, dto: UpdateUserAccessDto): Promise<UserResponseDto>;
    remove(req: AuthenticatedUser): Promise<void>;
}
