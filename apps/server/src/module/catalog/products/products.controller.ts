import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductResponseDto } from './dto/response-product.dto';
import { JwtAuthGuard } from '@/module/auth/guard/jwt-auth.guard';
import { RolesGuard } from '@/common/guard/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { roleEnum } from '@/module/roles/enums/roles.enum';
import { AuthenticatedUser } from '@/common/types/authenticated-user.type';
import { QueryProductDto } from './dto/query-product.dto';
import { ProductListItemDto } from './dto/product-list-item.dto';
import { ApiPaginatedResponse } from '@/common/decorators/api-paginated-response.decorator';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(roleEnum.ADMIN, roleEnum.STAFF_OPERATION)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tạo sản phẩm cùng danh sách ảnh' })
  @ApiBody({ type: CreateProductDto })
  @ApiResponse({ status: 201, description: 'Tạo product và images trong cùng transaction.', type: ProductResponseDto })
  @ApiResponse({ status: 400, description: 'Dữ liệu product hoặc images không hợp lệ.' })
  @ApiResponse({ status: 403, description: 'Tài khoản không hoạt động hoặc không có quyền.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy category hoặc brand đang hoạt động.' })
  @ApiResponse({ status: 409, description: 'Slug hoặc SKU đã được sử dụng.' })
  create(@Req() req: AuthenticatedUser, @Body() createProductDto: CreateProductDto) {
    return this.productsService.create(req.user.userId, createProductDto);
  }

  @Get()
  @ApiOperation({ summary: 'Danh sách sản phẩm đang hoạt động kèm ảnh đại diện' })
  @ApiPaginatedResponse(ProductListItemDto, 'Danh sách product phân trang; chỉ trả ảnh đại diện.')
  findAll(@Query() filters: QueryProductDto) {
    return this.productsService.findAll(filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết sản phẩm kèm toàn bộ ảnh đang hoạt động' })
  @ApiResponse({ status: 200, type: ProductResponseDto })
  @ApiResponse({ status: 400, description: 'ID sản phẩm không hợp lệ.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy sản phẩm đang hoạt động.' })
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(roleEnum.ADMIN, roleEnum.STAFF_OPERATION)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a product and manage its images' })
  @ApiBody({ type: UpdateProductDto })
  @ApiResponse({ status: 200, type: ProductResponseDto })
  @ApiResponse({ status: 400, description: 'The product update payload is invalid.' })
  @ApiResponse({ status: 403, description: 'The user is inactive, blocked, or lacks permission.' })
  @ApiResponse({ status: 404, description: 'The product, category, or brand was not found.' })
  @ApiResponse({ status: 409, description: 'The product slug or SKU is already in use.' })
  update(@Req() req: AuthenticatedUser, @Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(id, req.user.userId, updateProductDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(roleEnum.ADMIN, roleEnum.STAFF_OPERATION)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Xóa mềm sản phẩm' })
  @ApiResponse({ status: 204, description: 'Xóa mềm sản phẩm thành công.' })
  @ApiResponse({ status: 400, description: 'ID sản phẩm không hợp lệ.' })
  @ApiResponse({ status: 401, description: 'Token không hợp lệ.' })
  @ApiResponse({ status: 403, description: 'Không có quyền hoặc tài khoản không hoạt động.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy sản phẩm hoặc sản phẩm đã bị xóa.' })
  remove(@Param('id') id: string, @Req() req: AuthenticatedUser) {
    return this.productsService.remove(id, req.user.userId);
  }
}
