import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/module/auth/guard/jwt-auth.guard';
import { RolesGuard } from '@/common/guard/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { roleEnum } from '@/module/roles/enums/roles.enum';
import { AuthenticatedUser } from '@/common/types/authenticated-user.type';
import { BrandResponseDto } from './dto/response-brand.dto';
import { BrandsService } from './brands.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { CreateBrandsBulkDto } from './dto/create-brands-bulk.dto';
import { QueryBrandDto } from './dto/query-brand.dto';
import { ApiPaginatedResponse } from '@/common/decorators/api-paginated-response.decorator';

@ApiTags('Brands')
@Controller('brands')
export class BrandsController {
  constructor(private readonly brandsService: BrandsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(roleEnum.ADMIN, roleEnum.STAFF_OPERATION)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tạo thương hiệu (admin hoặc nhân viên vận hành)' })
  @ApiBody({ type: CreateBrandDto })
  @ApiResponse({ status: 201, description: 'Tạo thành công.', type: BrandResponseDto })
  @ApiResponse({ status: 400, description: 'Tên không hợp lệ hoặc không tạo được slug.' })
  @ApiResponse({ status: 401, description: 'Token không hợp lệ.' })
  @ApiResponse({ status: 403, description: 'Không có quyền hoặc tài khoản không hoạt động.' })
  @ApiResponse({ status: 409, description: 'Tên hoặc slug đã được sử dụng.' })
  create(@Req() req: AuthenticatedUser, @Body() createBrandDto: CreateBrandDto) {
    return this.brandsService.create(req.user.userId, createBrandDto);
  }

  @Post('bulk')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(roleEnum.ADMIN, roleEnum.STAFF_OPERATION)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tạo nhiều thương hiệu cùng lúc', description: 'Tất cả thương hiệu được lưu trong một transaction; nếu có lỗi thì không tạo thương hiệu nào.' })
  @ApiBody({ type: CreateBrandsBulkDto })
  @ApiResponse({ status: 201, description: 'Tạo thành công.', type: BrandResponseDto, isArray: true })
  @ApiResponse({ status: 400, description: 'Danh sách hoặc tên không hợp lệ.' })
  @ApiResponse({ status: 401, description: 'Token không hợp lệ.' })
  @ApiResponse({ status: 403, description: 'Không có quyền hoặc tài khoản không hoạt động.' })
  @ApiResponse({ status: 409, description: 'Tên hoặc slug trùng trong danh sách hoặc database.' })
  createBulk(@Req() req: AuthenticatedUser, @Body() dto: CreateBrandsBulkDto) {
    return this.brandsService.createBulk(req.user.userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Danh sách thương hiệu đang hoạt động' })
  @ApiPaginatedResponse(BrandResponseDto, 'Danh sách thương hiệu phân trang.')
  @ApiResponse({ status: 400, description: 'Tham số lọc hoặc phân trang không hợp lệ.' })
  findAll(@Query() filters: QueryBrandDto) {
    return this.brandsService.findAll(filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thương hiệu đang hoạt động theo ID' })
  @ApiResponse({ status: 200, description: 'Tìm thấy thương hiệu.', type: BrandResponseDto })
  @ApiResponse({ status: 400, description: 'ID không hợp lệ.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy thương hiệu đang hoạt động.' })
  findOneById(@Param('id') id: string) {
    return this.brandsService.findOneById(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(roleEnum.ADMIN, roleEnum.STAFF_OPERATION)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cập nhật thương hiệu đang hoạt động' })
  @ApiBody({ type: UpdateBrandDto })
  @ApiResponse({ status: 200, description: 'Cập nhật thành công.', type: BrandResponseDto })
  @ApiResponse({ status: 400, description: 'ID hoặc dữ liệu không hợp lệ.' })
  @ApiResponse({ status: 401, description: 'Token không hợp lệ.' })
  @ApiResponse({ status: 403, description: 'Không có quyền hoặc tài khoản không hoạt động.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy thương hiệu.' })
  @ApiResponse({ status: 409, description: 'Thương hiệu không hoạt động, version cũ hoặc tên/slug bị trùng.' })
  update(@Param('id') id: string, @Req() req: AuthenticatedUser, @Body() updateBrandDto: UpdateBrandDto) {
    return this.brandsService.update(id, req.user.userId, updateBrandDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(roleEnum.ADMIN, roleEnum.STAFF_OPERATION)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Xóa mềm thương hiệu' })
  @ApiResponse({ status: 204, description: 'Xóa mềm thành công.' })
  @ApiResponse({ status: 400, description: 'ID không hợp lệ.' })
  @ApiResponse({ status: 401, description: 'Token không hợp lệ.' })
  @ApiResponse({ status: 403, description: 'Không có quyền hoặc tài khoản không hoạt động.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy thương hiệu hoặc thương hiệu đã bị xóa.' })
  remove(@Param('id') id: string, @Req() req: AuthenticatedUser) {
    return this.brandsService.remove(id, req.user.userId);
  }
}
