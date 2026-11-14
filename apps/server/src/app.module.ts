import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { RolesModule } from "@/module/roles/roles.module";
import { SnakeNamingStrategy } from "typeorm-naming-strategies";
import { UserModule } from "@/module/user/user.module";
import { AuthModule } from "./module/auth/auth.module";
import { ConfigModule } from "@nestjs/config";
import jwtConfig from "./config/jwt.config";
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [jwtConfig],
    }),
    TypeOrmModule.forRoot({
      type: "postgres",
      host: "localhost",
      port: 5432,
      username: process.env.POSTGRES_USER || "postgres",
      password: process.env.POSTGRES_PASSWORD || "postgres",
      database: process.env.POSTGRES_DB || "ducanthPc",
      autoLoadEntities: true,
      synchronize: true,
      namingStrategy: new SnakeNamingStrategy(),
    }),
    RolesModule,
    UserModule,
    AuthModule,
  ],
})
export class AppModule {}
