import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseUUIDPipe,
  Req,
  Query,
  ValidationPipe,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { UserService } from "./user.service";
import { CreateUserDto } from "./dto/create-user.dto";

import { AuthModule } from "../auth/auth.module";
import { JwtAuthGuard } from "../auth/guard/jwt-auth.guard";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiBody, ApiParam } from "@nestjs/swagger";
import { AuthenticatedUser } from '@/common/types/authenticated-user.type';
import { UpdateClientProfileDto } from './dto/update-client-profile.dto';
import { UserResponseDto } from './dto/response-user.dto';
import { FindUsersDto } from './dto/find-users.dto';
import { ApiPaginatedResponse } from '@/common/decorators/api-paginated-response.decorator';
import { RolesGuard } from '@/common/guard/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { roleEnum } from '../roles/enums/roles.enum';
import { UpdateUserAccessDto } from './dto/update-user-access.dto';
import { ActiveUserGuard } from '@/common/guard/active-user.guard';
@Controller("user")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @ApiOperation({ summary: 'Create a user' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ status: 201, description: 'User created successfully.', type: UserResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid user data.' })
  @ApiResponse({ status: 409, description: 'Email is already in use.' })
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }
  @Get()
  @UseGuards(JwtAuthGuard, ActiveUserGuard, RolesGuard)
  @Roles(roleEnum.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List and search users as an administrator (10 per page)' })
  @ApiPaginatedResponse(UserResponseDto)
  @ApiResponse({ status: 400, description: 'Invalid search or filter parameters.' })
  @ApiResponse({ status: 401, description: 'Missing or invalid access token.' })
  @ApiResponse({ status: 403, description: 'Administrator role required.' })
  findAll(@Query(new ValidationPipe({ transform: true, whitelist: true })) query: FindUsersDto) {
    return this.userService.findAll(query);
  }

  @Get(":id")
  @UseGuards(JwtAuthGuard, ActiveUserGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Find a user by ID' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'User found.', type: UserResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid user ID.' })
  @ApiResponse({ status: 401, description: 'Missing or invalid access token.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  findOneForClient(@Param("id", ParseUUIDPipe) id: string, @Req() req: AuthenticatedUser) {
    return this.userService.findOneForClient(id, req.user.userId);
  }

  @Patch("me")
  @UseGuards(JwtAuthGuard, ActiveUserGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update the authenticated user profile' })
  @ApiBody({ type: UpdateClientProfileDto })
  @ApiResponse({ status: 200, description: 'Profile updated successfully.', type: UserResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid profile data.' })
  @ApiResponse({ status: 401, description: 'Missing or invalid access token.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @ApiResponse({ status: 409, description: 'Email or phone number is already in use.' })
  updateClientProfile(@Req() req: AuthenticatedUser, @Body() dto: UpdateClientProfileDto) {
    return this.userService.updateClientProfile(req.user.userId, dto);
  }

  @Patch(':id/access')
  @UseGuards(JwtAuthGuard, ActiveUserGuard, RolesGuard)
  @Roles(roleEnum.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Quản trị viên cập nhật vai trò hoặc trạng thái người dùng' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiBody({ type: UpdateUserAccessDto })
  @ApiResponse({ status: 200, description: 'Cập nhật thành công.', type: UserResponseDto })
  @ApiResponse({ status: 400, description: 'ID hoặc dữ liệu không hợp lệ.' })
  @ApiResponse({ status: 401, description: 'Token không hợp lệ.' })
  @ApiResponse({ status: 403, description: 'Chỉ admin đang hoạt động được phép thực hiện.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy người dùng hoặc vai trò.' })
  updateAccess(@Param('id', ParseUUIDPipe) id: string, @Req() req: AuthenticatedUser, @Body() dto: UpdateUserAccessDto) {
    return this.userService.updateAccess(id, req.user.userId, dto);
  }

  @Delete('me')
  @UseGuards(JwtAuthGuard, ActiveUserGuard, RolesGuard)
  @Roles(roleEnum.CLIENT)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete the authenticated client account' })
  @ApiResponse({ status: 204, description: 'Account deleted successfully.' })
  @ApiResponse({ status: 401, description: 'Missing or invalid access token.' })
  @ApiResponse({ status: 403, description: 'Client role required.' })
  @ApiResponse({ status: 404, description: 'Account not found or already deleted.' })
  remove(@Req() req: AuthenticatedUser) {
    return this.userService.remove(req.user.userId);
  }
}
