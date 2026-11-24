import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards } from '@nestjs/common';
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
  findAll() {
    return this.productsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(+id, updateProductDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productsService.remove(+id);
  }
}
