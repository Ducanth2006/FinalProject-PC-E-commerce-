import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/module/auth/guard/jwt-auth.guard';
import { RolesGuard } from '@/common/guard/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { roleEnum } from '@/module/roles/enums/roles.enum';
import { AuthenticatedUser } from '@/common/types/authenticated-user.type';
import { CreatePcBundleComponentDto } from './dto/create-pc-bundle-component.dto';
import { UpdatePcBundleComponentDto } from './dto/update-pc-bundle-component.dto';
import { PcBundleComponentsService } from './pc-bundle-components.service';

@ApiTags('PC Bundle Components')
@Controller('pc-bundle-components')
export class PcBundleComponentsController {
  constructor(private readonly pcBundleComponentsService: PcBundleComponentsService) {}

  @Get(':pcId')
  @ApiOperation({ summary: 'Lấy cấu hình linh kiện của PC bundle' })
  @ApiResponse({ status: 200, description: 'Danh sách linh kiện trong bộ PC.' })
  findAll(@Param('pcId') pcId: string) {
    return this.pcBundleComponentsService.findAll(pcId);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(roleEnum.ADMIN, roleEnum.STAFF_OPERATION)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Thêm một linh kiện vào PC bundle' })
  @ApiBody({ type: CreatePcBundleComponentDto })
  @ApiResponse({ status: 201, description: 'Đã thêm linh kiện vào bundle.' })
  @ApiResponse({ status: 403, description: 'Chỉ Admin hoặc Staff Operation được sửa cấu hình.' })
  create(@Req() req: AuthenticatedUser, @Body() dto: CreatePcBundleComponentDto) {
    return this.pcBundleComponentsService.create(req.user.userId, dto);
  }

  @Patch(':pcId/:componentId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(roleEnum.ADMIN, roleEnum.STAFF_OPERATION)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Sửa số lượng hoặc thứ tự của một linh kiện trong PC bundle' })
  @ApiBody({ type: UpdatePcBundleComponentDto })
  @ApiResponse({ status: 200, description: 'Đã cập nhật linh kiện.' })
  @ApiResponse({ status: 403, description: 'Chỉ Admin hoặc Staff Operation được sửa cấu hình.' })
  update(
    @Param('pcId') pcId: string,
    @Param('componentId') componentId: string,
    @Req() req: AuthenticatedUser,
    @Body() dto: UpdatePcBundleComponentDto,
  ) {
    return this.pcBundleComponentsService.update(pcId, componentId, req.user.userId, dto);
  }

  @Delete(':pcId/:componentId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(roleEnum.ADMIN, roleEnum.STAFF_OPERATION)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Bỏ một linh kiện khỏi PC bundle' })
  @ApiResponse({ status: 204, description: 'Đã bỏ linh kiện khỏi bundle.' })
  @ApiResponse({ status: 403, description: 'Chỉ Admin hoặc Staff Operation được sửa cấu hình.' })
  remove(@Param('pcId') pcId: string, @Param('componentId') componentId: string, @Req() req: AuthenticatedUser) {
    return this.pcBundleComponentsService.remove(pcId, componentId, req.user.userId);
  }
}
