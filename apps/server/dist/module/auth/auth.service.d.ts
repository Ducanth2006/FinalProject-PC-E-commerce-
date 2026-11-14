import { ConfigType } from "@nestjs/config";
import { UserService } from "../user/user.service";
import { JwtService } from "@nestjs/jwt";
import { LoginDto } from "./dto/login.dto";
import jwtConfig from "../../config/jwt.config";
export declare class AuthService {
    private readonly userService;
    private readonly jwtService;
    private readonly jwtConfiguration;
    constructor(userService: UserService, jwtService: JwtService, jwtConfiguration: ConfigType<typeof jwtConfig>);
    private readonly logger;
    login(data: LoginDto): Promise<{
        AccessToken: string;
        RefreshToken: string;
        user: {
            id: string;
            email: string | null;
            roleId: string;
        };
    }>;
}
