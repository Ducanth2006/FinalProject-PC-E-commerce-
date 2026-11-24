"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const roles_module_1 = require("./module/roles/roles.module");
const typeorm_naming_strategies_1 = require("typeorm-naming-strategies");
const user_module_1 = require("./module/user/user.module");
const auth_module_1 = require("./module/auth/auth.module");
const config_1 = require("@nestjs/config");
const province_module_1 = require("./module/province/province.module");
const ward_module_1 = require("./module/ward/ward.module");
const user_address_module_1 = require("./module/user-address/user-address.module");
const jwt_config_1 = __importDefault(require("./config/jwt.config"));
const brands_module_1 = require("./module/catalog/brands/brands.module");
const categories_module_1 = require("./module/catalog/categories/categories.module");
const products_module_1 = require("./module/catalog/products/products.module");
const product_promotions_module_1 = require("./module/catalog/product-promotions/product-promotions.module");
const pc_bundle_components_module_1 = require("./module/pc-bundle-components/pc-bundle-components.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                load: [jwt_config_1.default],
            }),
            typeorm_1.TypeOrmModule.forRoot({
                type: "postgres",
                host: "localhost",
                port: 5432,
                username: process.env.POSTGRES_USER || "postgres",
                password: process.env.POSTGRES_PASSWORD || "postgres",
                database: process.env.POSTGRES_DB || "ducanthPc",
                autoLoadEntities: true,
                synchronize: true,
                namingStrategy: new typeorm_naming_strategies_1.SnakeNamingStrategy(),
            }),
            roles_module_1.RolesModule,
            user_module_1.UserModule,
            auth_module_1.AuthModule,
            province_module_1.ProvinceModule,
            ward_module_1.WardModule,
            user_address_module_1.UserAddressModule,
            brands_module_1.BrandsModule,
            categories_module_1.CategoriesModule,
            products_module_1.ProductsModule,
            product_promotions_module_1.ProductPromotionsModule,
            pc_bundle_components_module_1.PcBundleComponentsModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map