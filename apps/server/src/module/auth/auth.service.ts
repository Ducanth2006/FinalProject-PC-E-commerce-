import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { InjectRepository } from "@nestjs/typeorm";
import { ConfigService, ConfigType } from "@nestjs/config";
import { UserService } from "../user/user.service";
import { JwtService } from "@nestjs/jwt";
import { LoginDto } from "./dto/login.dto";
import { emit } from "process";
import jwtConfig from "@/config/jwt.config";
import { UserStatus } from "../user/enums/user-status.enum";

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
  ) {}
  private readonly logger = new Logger(AuthService.name);

  async login(data: LoginDto) {
    if (!data.email || !data.password) {
      throw new BadRequestException("Missing email or password");
    }
    const user = await this.userService.findByEmailAndPassword(data.email);
    
    if (!user || !user.passwordHash) {
      throw new UnauthorizedException("Email or passwordHash isn't correct");
    }
    const isPasswordCorrect = await bcrypt.compare(
      data.password,
      user.passwordHash,
    );
    if (!isPasswordCorrect) {
      throw new UnauthorizedException("Password isn't correct");
    }
    if(user.status=== UserStatus.BLOCKED ){
      throw new ForbiddenException({code:"403", message:"Your account is blocked by admin"})
    }
    
    const payload = { sub: user.id, email: user.email, roleId: user.roleId };
    this.logger.log(payload);
    const [AccessToken, RefreshToken] = await Promise.all([
      this.jwtService.signAsync(payload),
      this.jwtService.signAsync(payload, {
        secret: this.jwtConfiguration.refreshSecret,
        expiresIn: this.jwtConfiguration.refreshExpireIn as any,
      }),
    ]);
    await this.userService.updateRefeshTokenKey(user.id, RefreshToken);
    return {
      AccessToken,
      RefreshToken,
      user: {
        id: user.id,
        email: user.email,
        roleId: user.roleId,
      },
    };
  }
  async refreshTokens(userId: string, oldRefreshToken: string) {
    const user = await this.userService.findOneWithRefreshTokenKey(userId);
    // Check user exist
    if (!user || !user.refreshTokenHash) {
      throw new UnauthorizedException("Your access is denied");
    }
    // Compare token key
    const isMatching = await bcrypt.compare(
      oldRefreshToken,
      user.refreshTokenHash,
    );
    if (!isMatching) {
      throw new UnauthorizedException("Refresh token isn't validate");
    }
    const payload = { sub: user.id, email: user.email, roleId: user.roleId };
    const [AccessToken, RefreshToken] = await Promise.all([
      this.jwtService.signAsync(payload),
      this.jwtService.signAsync(payload, {
        secret: this.jwtConfiguration.refreshSecret,
        expiresIn: this.jwtConfiguration.refreshExpireIn as any,
      }),
    ]);
    await this.userService.updateRefeshTokenKey(userId, RefreshToken);
    return {
      AccessToken,
      RefreshToken,
      user: {
        id: user.id,
        email: user.email,
        roleId: user.roleId,
      },
    };
  }
  async logOut(userId: string) {
    await this.userService.updateRefeshTokenKey(userId, null);
    return { message: "Log out successfully " };
  }
}
