import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "@/module/auth/guard/jwt-auth.guard";
import { RolesGuard } from "@/common/guard/roles.guard";
import { Roles } from "@/common/decorators/roles.decorator";
import { roleEnum } from "@/module/roles/enums/roles.enum";
import { AuthenticatedUser } from "@/common/types/authenticated-user.type";
import { ApiPaginatedResponse } from "@/common/decorators/api-paginated-response.decorator";
import { ProductPromotionsService } from "./product-promotions.service";
import { CreateProductPromotionDto } from "./dto/create-product-promotion.dto";
import { UpdateProductPromotionDto } from "./dto/update-product-promotion.dto";
import { QueryProductPromotionDto } from "./dto/query-product-promotion.dto";
import { ProductPromotionResponseDto } from "./dto/response-product-promotion.dto";

@ApiTags("Product Promotions")
@Controller("product-promotions")
export class ProductPromotionsController {
  constructor(private readonly productPromotionsService: ProductPromotionsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(roleEnum.ADMIN, roleEnum.STAFF_OPERATION)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Tạo khuyến mãi cho sản phẩm" })
  @ApiBody({ type: CreateProductPromotionDto })
  @ApiResponse({ status: 201, type: ProductPromotionResponseDto })
  @ApiResponse({ status: 400, description: "Dữ liệu hoặc thời gian khuyến mãi không hợp lệ." })
  @ApiResponse({ status: 404, description: "Không tìm thấy sản phẩm đang hoạt động." })
  @ApiResponse({ status: 409, description: "Sản phẩm đã có promotion đang bật và chưa hết hạn." })
  create(@Req() req: AuthenticatedUser, @Body() dto: CreateProductPromotionDto) {
    return this.productPromotionsService.create(req.user.userId, dto);
  }

  @Get()
  @ApiOperation({ summary: "Danh sách khuyến mãi đang hoạt động" })
  @ApiPaginatedResponse(ProductPromotionResponseDto, "Danh sách promotion phân trang.")
  findAll(@Query() filters: QueryProductPromotionDto) {
    return this.productPromotionsService.findAll(filters);
  }

  @Get(":id")
  @ApiOperation({ summary: "Lấy promotion theo ID" })
  @ApiResponse({ status: 200, type: ProductPromotionResponseDto })
  @ApiResponse({ status: 404, description: "Không tìm thấy promotion đang hoạt động." })
  findOne(@Param("id") id: string) {
    return this.productPromotionsService.findOne(id);
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(roleEnum.ADMIN, roleEnum.STAFF_OPERATION)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Cập nhật hoặc tắt promotion" })
  @ApiBody({ type: UpdateProductPromotionDto })
  @ApiResponse({ status: 200, type: ProductPromotionResponseDto })
  @ApiResponse({ status: 400, description: "Dữ liệu không hợp lệ hoặc giá promotion không thấp hơn giá sản phẩm." })
  @ApiResponse({ status: 404, description: "Không tìm thấy promotion." })
  @ApiResponse({ status: 409, description: "Promotion không hoạt động hoặc version đã thay đổi." })
  update(@Param("id") id: string, @Req() req: AuthenticatedUser, @Body() dto: UpdateProductPromotionDto) {
    return this.productPromotionsService.update(id, req.user.userId, dto);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(roleEnum.ADMIN, roleEnum.STAFF_OPERATION)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Xóa mềm promotion" })
  @ApiResponse({ status: 204, description: "Xóa mềm thành công." })
  @ApiResponse({ status: 404, description: "Không tìm thấy promotion." })
  remove(@Param("id") id: string, @Req() req: AuthenticatedUser) {
    return this.productPromotionsService.remove(id, req.user.userId);
  }
}
