"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("@nestjs/config");
exports.default = (0, config_1.registerAs)("jwt", () => ({
    accessSecret: process.env.JWT_ACCESS_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    accessExpireIn: process.env.JWT_ACCESS_EXPIRES_IN || "30m",
    refreshExpireIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
}));
//# sourceMappingURL=jwt.config.js.map