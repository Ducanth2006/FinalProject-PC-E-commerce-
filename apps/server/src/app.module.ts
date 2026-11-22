import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { RolesModule } from "@/module/roles/roles.module";
import { SnakeNamingStrategy } from "typeorm-naming-strategies";
import { UserModule } from "@/module/user/user.module";
import { AuthModule } from "./module/auth/auth.module";
import { ConfigModule } from "@nestjs/config";
import { ProvinceModule } from '@/module/province/province.module';
import { WardModule } from '@/module/ward/ward.module';
import { UserAddressModule } from '@/module/user-address/user-address.module';
import jwtConfig from "./config/jwt.config";
import { BrandsModule } from './module/catalog/brands/brands.module';
import { CategoriesModule } from './module/catalog/categories/categories.module';
import { ProductsModule } from './module/catalog/products/products.module';
import { PcBundleComponentsModule } from './module/pc-bundle-components/pc-bundle-components.module';
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
    ProvinceModule,
    WardModule,
    UserAddressModule,
    BrandsModule,
    CategoriesModule,
    ProductsModule,
    PcBundleComponentsModule,
  ],
})
export class AppModule {}
