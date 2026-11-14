import {
  BadRequestException,
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
}
