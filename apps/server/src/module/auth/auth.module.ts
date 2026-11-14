import { forwardRef, Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { ConfigModule, ConfigService, ConfigType } from "@nestjs/config";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { UserModule } from "../user/user.module";
import { JwtStrategies } from "./strategies/jwt.strategy";
import { PassportModule } from "@nestjs/passport";
import jwtConfig from "@/config/jwt.config";
import { JwtRefreshStrategies } from "./strategies/jwt-refresh.strategy";

@Module({
  imports: [
    forwardRef(() => UserModule),
    ConfigModule,
    PassportModule.register({ defaultStrategy: "jwt" }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [jwtConfig.KEY],
      useFactory: (jwtConfiguration: ConfigType<typeof jwtConfig>) => ({
        secret: jwtConfiguration.accessSecret,
        signOptions: {
          // Ép kiểu 'as any' để bỏ qua kiểm tra strict type của TypeScript cho expiresIn
          expiresIn: jwtConfiguration.accessExpireIn as any,
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategies, JwtRefreshStrategies],
  exports: [AuthService, PassportModule],
})
export class AuthModule {}
