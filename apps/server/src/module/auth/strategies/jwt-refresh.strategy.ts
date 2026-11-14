import jwtConfig from "@/config/jwt.config";
import { UserService } from "@/module/user/user.service";
import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService, ConfigType } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { Request } from "express";

@Injectable()
export class JwtRefreshStrategies extends PassportStrategy(
    Strategy,
    "jwt-refresh",
) {
    constructor(
        private readonly userService: UserService,
        @Inject(jwtConfig.KEY)
        private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: jwtConfiguration.refreshSecret,
            //   Khác với bên cấp access token
            passReqToCallback: true,
        });
    }
    async validate(
        reg: Request,
        payload: { sub: string; email: string; roleId: string },
    ) {
        const refreshToken = ExtractJwt.fromAuthHeaderAsBearerToken()(reg);

        if (!refreshToken) {
            throw new UnauthorizedException("Refresh token isn't existing");
        }
        return {
            userId: payload.sub,
            email: payload.email,
            roleId: payload.roleId,
            refreshToken,
        };
    }
}
