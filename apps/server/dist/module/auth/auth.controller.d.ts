import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(loginDto: LoginDto): Promise<{
        AccessToken: string;
        RefreshToken: string;
        user: {
            id: string;
            email: string | null;
            roleId: string;
        };
    }>;
    refresh(req: any): Promise<{
        AccessToken: string;
        RefreshToken: string;
        user: {
            id: string;
            email: string | null;
            roleId: string;
        };
    }>;
}
