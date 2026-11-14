import { registerAs } from "@nestjs/config";
export default registerAs("jwt", () => ({
    accessSecret:
        process.env.JWT_ACCESS_SECRET as string,
    refreshSecret:
        process.env.JWT_REFRESH_SECRET as string  ,
    accessExpireIn: process.env.JWT_ACCESS_EXPIRES_IN || "30m",
    refreshExpireIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
}));
//  ||
        // "dac9919c24fec89570eb2d65537c4bf108b0833a567ff2c0877d764f690fcd82",
// ||
        // "93f8f0784e336006535f52a5c96f5319d55081498f6106ed25ed0a8d7a9d9873"