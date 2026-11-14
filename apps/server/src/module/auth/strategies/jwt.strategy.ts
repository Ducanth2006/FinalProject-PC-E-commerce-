import jwtConfig from '@/config/jwt.config';
import { UserService } from '@/module/user/user.service';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService, ConfigType } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';


@Injectable()
export class JwtStrategies extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly userService: UserService,
    private readonly configService: ConfigService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
  ) {
   
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConfiguration.accessSecret,
    });
  }
  async validate(payload: {sub:string,email:string,roleId:string}) {
    const user = await this.userService.findOne(payload.sub);
    if(!user){
        throw new UnauthorizedException("Account not found or deleted ")
    }
    return {
        userId:user.id,
        email:user.email,
        roleId:user.roleId
    }
      
  }
}
