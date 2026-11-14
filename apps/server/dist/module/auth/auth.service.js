"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const bcrypt = __importStar(require("bcrypt"));
const user_service_1 = require("../user/user.service");
const jwt_1 = require("@nestjs/jwt");
const jwt_config_1 = __importDefault(require("../../config/jwt.config"));
let AuthService = AuthService_1 = class AuthService {
    userService;
    jwtService;
    jwtConfiguration;
    constructor(userService, jwtService, jwtConfiguration) {
        this.userService = userService;
        this.jwtService = jwtService;
        this.jwtConfiguration = jwtConfiguration;
    }
    logger = new common_1.Logger(AuthService_1.name);
    async login(data) {
        if (!data.email || !data.password) {
            throw new common_1.BadRequestException("Missing email or password");
        }
        const user = await this.userService.findByEmailAndPassword(data.email);
        if (!user || !user.passwordHash) {
            throw new common_1.UnauthorizedException("Email or passwordHash isn't correct");
        }
        const isPasswordCorrect = await bcrypt.compare(data.password, user.passwordHash);
        if (!isPasswordCorrect) {
            throw new common_1.UnauthorizedException("Password isn't correct");
        }
        const payload = { sub: user.id, email: user.email, roleId: user.roleId };
        this.logger.log(payload);
        const [AccessToken, RefreshToken] = await Promise.all([
            this.jwtService.signAsync(payload),
            this.jwtService.signAsync(payload, {
                secret: this.jwtConfiguration.refreshSecret,
                expiresIn: this.jwtConfiguration.refreshExpireIn,
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
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, common_1.Inject)(jwt_config_1.default.KEY)),
    __metadata("design:paramtypes", [user_service_1.UserService,
        jwt_1.JwtService, void 0])
], AuthService);
//# sourceMappingURL=auth.service.js.map