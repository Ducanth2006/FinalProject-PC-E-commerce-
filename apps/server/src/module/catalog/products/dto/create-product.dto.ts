import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsDefined,
  IsEnum,
  IsObject,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  ValidateIf,
  ValidateNested,
} from "class-validator";
import { ProductType } from "../entities/product.entity";
import { CreateProductImageDto } from "./create-product-image.dto";

export class CreateProductDto {
  @ApiProperty({ example: "ASUS GeForce RTX 5070" })
  @IsDefined()
  @IsString()
  @Matches(/\S/)
  @MaxLength(255)
  name: string;

  @ApiProperty({ example: "ASUS-RTX5070-12G", maxLength: 255 })
  @IsDefined()
  @IsString()
  @Matches(/\S/)
  @MaxLength(255)
  sku: string;

  @ApiProperty({ enum: ProductType, example: ProductType.COMPONENT })
  @IsDefined()
  @IsEnum(ProductType)
  type: ProductType;

  @ApiProperty({ description: "ID danh mục đang hoạt động.", example: "12" })
  @IsDefined()
  @IsString()
  @Matches(/^[1-9]\d*$/)
  @MaxLength(19)
  categoryId: string;

  @ApiProperty({ description: "ID thương hiệu đang hoạt động.", example: "3" })
  @IsDefined()
  @IsString()
  @Matches(/^[1-9]\d*$/)
  @MaxLength(19)
  brandId: string;

  @ApiPropertyOptional({ description: "Thông số sản phẩm theo từng loại hàng.", type: "object", additionalProperties: true, example: { memory: "12GB GDDR7" } })
  @ValidateIf((_object, value) => value !== undefined)
  @IsObject()
  specs?: Record<string, unknown>;

  @ApiPropertyOptional({ description: "Mô tả sản phẩm.", nullable: true })
  @ValidateIf((_object, value) => value !== undefined && value !== null)
  @IsString()
  description?: string | null;

  @ApiProperty({ description: "Giá niêm yết, đơn vị đồng.", example: "15990000" })
  @IsDefined()
  @IsString()
  @Matches(/^[1-9]\d*$/)
  @MaxLength(19)
  price: string;

  @ApiProperty({ type: [CreateProductImageDto], minItems: 1, maxItems: 20 })
  @IsDefined()
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(10)
  @ValidateNested({ each: true })
  @Type(() => CreateProductImageDto)
  images: CreateProductImageDto[];
}
