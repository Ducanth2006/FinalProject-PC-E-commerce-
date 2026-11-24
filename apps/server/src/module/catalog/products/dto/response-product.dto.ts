import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Exclude, Expose, Type } from "class-transformer";
import { ProductType } from "../entities/product.entity";
import { ProductImageResponseDto } from "./response-product-image.dto";

@Exclude()
export class ProductResponseDto {
  @Expose() @ApiProperty({ example: "15" }) id: string;
  @Expose() @ApiProperty({ example: "asus-geforce-rtx-5070" }) slug: string;
  @Expose() @ApiProperty({ example: "ASUS-RTX5070-12G" }) sku: string;
  @Expose() @ApiProperty({ example: "ASUS GeForce RTX 5070" }) name: string;
  @Expose() @ApiProperty({ enum: ProductType }) type: ProductType;
  @Expose() @ApiProperty({ example: "12" }) categoryId: string;
  @Expose() @ApiProperty({ example: "3" }) brandId: string;
  @Expose() @ApiProperty({ type: "object", additionalProperties: true }) specs: Record<string, unknown>;
  @Expose() @ApiPropertyOptional({ type: String, nullable: true }) description: string | null;
  @Expose() @ApiProperty({ example: "15990000" }) price: string;
  @Expose() @ApiProperty({ example: true }) isActive: boolean;
  @Expose() @Type(() => ProductImageResponseDto) @ApiProperty({ type: [ProductImageResponseDto] }) images: ProductImageResponseDto[];
  @Expose() @ApiProperty({ type: String, format: "date-time" }) createdAt: Date;
  @Expose() @ApiProperty({ type: String, format: "uuid", nullable: true }) createdBy: string | null;
}
