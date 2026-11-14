import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { CreateAuthDto } from "./dto/create-auth.dto";
import { UpdateAuthDto } from "./dto/update-auth.dto";
import { LoginDto } from "./dto/login.dto";
import { ApiBearerAuth } from "@nestjs/swagger";
import { JwtRefreshAuthGuard } from "./guard/jwt-refresh-auth.guard";
import { RequestDto } from "./dto/Request.dto";
import { JwtAuthGuard } from "./guard/jwt-auth.guard";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post("/login")
  @HttpCode(HttpStatus.OK)
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
  @ApiBearerAuth()
  @UseGuards(JwtRefreshAuthGuard)
  @Post("/refresh")
  @HttpCode(HttpStatus.OK)
  refresh(@Req() req: any) {
    return this.authService.refreshTokens(
      req.user.userId,
      req.user.refreshToken,
    );
  }
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post("/logout")
  @HttpCode(HttpStatus.OK)
  logout(@Req() req: any) {
    return this.authService.logOut(req.user.userId);
  }
}
