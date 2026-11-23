import jwtConfig from "../../../config/jwt.config";
import { UserService } from "../../user/user.service";
import { ConfigService, ConfigType } from '@nestjs/config';
import { Strategy } from 'passport-jwt';
declare const JwtStrategies_base: new (...args: [opt: import("passport-jwt").StrategyOptionsWithoutRequest] | [opt: import("passport-jwt").StrategyOptionsWithRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class JwtStrategies extends JwtStrategies_base {
    private readonly userService;
    private readonly configService;
    private readonly jwtConfiguration;
    constructor(userService: UserService, configService: ConfigService, jwtConfiguration: ConfigType<typeof jwtConfig>);
    validate(payload: {
        sub: string;
        email: string;
        roleId: string;
    }): Promise<{
        userId: string;
        email: string | null;
        roleId: string;
    }>;
}
export {};
