import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/module/auth/guard/jwt-auth.guard';
import { RolesGuard } from '@/common/guard/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { roleEnum } from '@/module/roles/enums/roles.enum';
import { AuthenticatedUser } from '@/common/types/authenticated-user.type';
import { CategoryResponseDto } from './dto/response-category.dto';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { QueryCategoryDto } from './dto/query-category.dto';
import { CreateCategoriesDto } from './dto/create-categories.dto';
import { ApiPaginatedResponse } from '@/common/decorators/api-paginated-response.decorator';

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(roleEnum.ADMIN, roleEnum.STAFF_OPERATION)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tạo danh mục (admin hoặc nhân viên vận hành)' })
  @ApiBody({ type: CreateCategoryDto })
  @ApiResponse({ status: 201, description: 'Tạo danh mục thành công.', type: CategoryResponseDto })
  @ApiResponse({ status: 400, description: 'Tên hoặc ID danh mục cha không hợp lệ.' })
  @ApiResponse({ status: 401, description: 'Token không hợp lệ.' })
  @ApiResponse({ status: 403, description: 'Không có quyền hoặc tài khoản không hoạt động.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy danh mục cha đang hoạt động.' })
  @ApiResponse({ status: 409, description: 'Slug danh mục đã được sử dụng.' })
  create(@Req() req: AuthenticatedUser, @Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.create(req.user.userId, createCategoryDto);
  }

  @Post('bulk')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(roleEnum.ADMIN, roleEnum.STAFF_OPERATION)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tạo nhiều danh mục', description: 'Lưu toàn bộ trong một transaction; parentId phải tham chiếu danh mục đã tồn tại.' })
  @ApiBody({ type: CreateCategoriesDto })
  @ApiResponse({ status: 201, description: 'Tạo danh mục thành công.', type: CategoryResponseDto, isArray: true })
  @ApiResponse({ status: 400, description: 'Danh sách hoặc dữ liệu không hợp lệ.' })
  @ApiResponse({ status: 401, description: 'Token không hợp lệ.' })
  @ApiResponse({ status: 403, description: 'Không có quyền hoặc tài khoản không hoạt động.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy danh mục cha đang hoạt động.' })
  @ApiResponse({ status: 409, description: 'Tên trùng trong danh sách hoặc slug trùng.' })
  createBulk(@Req() req: AuthenticatedUser, @Body() dto: CreateCategoriesDto) {
    return this.categoriesService.createBulk(req.user.userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Danh sách danh mục đang hoạt động', description: 'Lọc theo một phần tên, slug chính xác hoặc slug danh mục cha trực tiếp; các bộ lọc được kết hợp.' })
  @ApiPaginatedResponse(CategoryResponseDto, 'Danh sách danh mục phân trang.')
  @ApiResponse({ status: 400, description: 'Tham số lọc không hợp lệ.' })
  findAll(@Query() filters: QueryCategoryDto) {
    return this.categoriesService.findAll(filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy danh mục đang hoạt động theo ID' })
  @ApiResponse({ status: 200, description: 'Tìm thấy danh mục.', type: CategoryResponseDto })
  @ApiResponse({ status: 400, description: 'ID không hợp lệ.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy danh mục đang hoạt động.' })
  findOne(@Param('id') id: string) {
    return this.categoriesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(roleEnum.ADMIN, roleEnum.STAFF_OPERATION)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cập nhật danh mục đang hoạt động' })
  @ApiBody({ type: UpdateCategoryDto })
  @ApiResponse({ status: 200, description: 'Cập nhật thành công.', type: CategoryResponseDto })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ hoặc danh mục cha tạo thành vòng lặp.' })
  @ApiResponse({ status: 401, description: 'Token không hợp lệ.' })
  @ApiResponse({ status: 403, description: 'Không có quyền hoặc tài khoản không hoạt động.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy danh mục hoặc danh mục cha.' })
  @ApiResponse({ status: 409, description: 'Tên, slug trùng hoặc version đã thay đổi.' })
  update(@Param('id') id: string, @Req() req: AuthenticatedUser, @Body() dto: UpdateCategoryDto) {
    return this.categoriesService.update(id, req.user.userId, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(roleEnum.ADMIN, roleEnum.STAFF_OPERATION)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Xóa mềm danh mục' })
  @ApiResponse({ status: 204, description: 'Xóa mềm thành công.' })
  @ApiResponse({ status: 400, description: 'ID không hợp lệ.' })
  @ApiResponse({ status: 401, description: 'Token không hợp lệ.' })
  @ApiResponse({ status: 403, description: 'Không có quyền hoặc tài khoản không hoạt động.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy danh mục hoặc danh mục đã bị xóa.' })
  remove(@Param('id') id: string, @Req() req: AuthenticatedUser) {
    return this.categoriesService.remove(id, req.user.userId);
  }
}
