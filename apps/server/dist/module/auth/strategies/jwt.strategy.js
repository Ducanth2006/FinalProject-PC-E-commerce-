"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtStrategies = void 0;
const jwt_config_1 = __importDefault(require("../../../config/jwt.config"));
const user_service_1 = require("../../user/user.service");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const passport_1 = require("@nestjs/passport");
const passport_jwt_1 = require("passport-jwt");
let JwtStrategies = class JwtStrategies extends (0, passport_1.PassportStrategy)(passport_jwt_1.Strategy, 'jwt') {
    userService;
    configService;
    jwtConfiguration;
    constructor(userService, configService, jwtConfiguration) {
        super({
            jwtFromRequest: passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: jwtConfiguration.accessSecret,
        });
        this.userService = userService;
        this.configService = configService;
        this.jwtConfiguration = jwtConfiguration;
    }
    async validate(payload) {
        const user = await this.userService.findOne(payload.sub);
        if (!user) {
            throw new common_1.UnauthorizedException("Account not found or deleted ");
        }
        return {
            userId: user.id,
            email: user.email,
            roleId: user.roleId
        };
    }
};
exports.JwtStrategies = JwtStrategies;
exports.JwtStrategies = JwtStrategies = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, common_1.Inject)(jwt_config_1.default.KEY)),
    __metadata("design:paramtypes", [user_service_1.UserService,
        config_1.ConfigService, void 0])
], JwtStrategies);
//# sourceMappingURL=jwt.strategy.js.map