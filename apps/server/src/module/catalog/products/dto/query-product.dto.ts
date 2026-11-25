import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsDateString, IsEnum, IsIn, IsOptional, IsString, Matches, MaxLength } from "class-validator";
import { ProductType } from "../entities/product.entity";

export enum ProductSort {
  NAME_ASC = "nameAsc",
  NEWEST = "newest",
  PRICE_ASC = "priceAsc",
  PRICE_DESC = "priceDesc",
}

export class QueryProductDto {
  @ApiPropertyOptional({ description: "Trang cần lấy, bắt đầu từ 1.", example: "1", default: "1" })
  @IsOptional() @IsString() @Matches(/^[1-9]\d*$/) @MaxLength(10)
  page?: string;

  @ApiPropertyOptional({ description: "Số sản phẩm mỗi trang.", example: "20", default: "10" })
  @IsOptional() @IsString() @Matches(/^[1-9]\d*$/) @MaxLength(10)
  pageSize?: string;

  @ApiPropertyOptional({ description: "Tìm theo một phần tên sản phẩm, không phân biệt hoa thường.", example: "geforce" })
  @IsOptional() @IsString() @MaxLength(255)
  name?: string;

  @ApiPropertyOptional({ description: "Lọc theo slug danh mục chính xác.", example: "card-man-hinh" })
  @IsOptional() @IsString() @Matches(/\S/) @MaxLength(255)
  categorySlug?: string;

  @ApiPropertyOptional({ description: "Lọc theo slug thương hiệu chính xác.", example: "asus" })
  @IsOptional() @IsString() @Matches(/\S/) @MaxLength(255)
  brandSlug?: string;

  @ApiPropertyOptional({ description: "Lọc PC bundle theo tên/model CPU.", example: "Ryzen 5 5500" })
  @IsOptional() @IsString() @Matches(/\S/) @MaxLength(255)
  cpu?: string;

  @ApiPropertyOptional({ description: "Lọc PC bundle theo tên/model GPU.", example: "RTX 5050" })
  @IsOptional() @IsString() @Matches(/\S/) @MaxLength(255)
  gpu?: string;

  @ApiPropertyOptional({ description: "Dung lượng RAM tối thiểu của PC bundle, đơn vị GB.", example: "32" })
  @IsOptional() @IsString() @Matches(/^[1-9]\d*$/) @MaxLength(6)
  minRamGb?: string;

  @ApiPropertyOptional({ description: "Dung lượng SSD/HDD tối thiểu của PC bundle, đơn vị GB.", example: "1000" })
  @IsOptional() @IsString() @Matches(/^[1-9]\d*$/) @MaxLength(6)
  minStorageGb?: string;

  @ApiPropertyOptional({ description: "true: có promotion đang hiệu lực; false: không có.", enum: ["true", "false"] })
  @IsOptional() @IsString() @IsIn(["true", "false"])
  hasPromotion?: "true" | "false";

  @ApiPropertyOptional({ description: "Giá thực tế tối thiểu, tính cả promotion đang hiệu lực.", example: "5000000" })
  @IsOptional() @IsString() @Matches(/^(0|[1-9]\d*)$/) @MaxLength(19)
  minPrice?: string;

  @ApiPropertyOptional({ description: "Giá thực tế tối đa, tính cả promotion đang hiệu lực.", example: "20000000" })
  @IsOptional() @IsString() @Matches(/^(0|[1-9]\d*)$/) @MaxLength(19)
  maxPrice?: string;

  @ApiPropertyOptional({ description: "Chỉ lấy product tạo từ thời điểm này trở đi (bao gồm thời điểm này).", example: "2026-11-01T00:00:00.000Z" })
  @IsOptional() @IsDateString()
  createdAfter?: string;

  @ApiPropertyOptional({ description: "Chỉ lấy product tạo trước thời điểm này (không bao gồm thời điểm này).", example: "2026-12-01T00:00:00.000Z" })
  @IsOptional() @IsDateString()
  createdBefore?: string;

  @ApiPropertyOptional({ enum: ProductType })
  @IsOptional() @IsEnum(ProductType)
  type?: ProductType;

  @ApiPropertyOptional({ description: "Thứ tự sắp xếp.", enum: ProductSort, default: ProductSort.NAME_ASC })
  @IsOptional() @IsEnum(ProductSort)
  sort?: ProductSort;
}
