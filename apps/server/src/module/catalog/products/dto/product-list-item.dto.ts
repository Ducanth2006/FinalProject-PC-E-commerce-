import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Exclude, Expose } from "class-transformer";
import { ProductType } from "../entities/product.entity";

@Exclude()
export class ProductListItemDto {
  @Expose() @ApiProperty({ example: "15" }) id: string;
  @Expose() @ApiProperty({ example: "asus-geforce-rtx-5070" }) slug: string;
  @Expose() @ApiProperty({ example: "ASUS GeForce RTX 5070" }) name: string;
  @Expose() @ApiProperty({ enum: ProductType }) type: ProductType;
  @Expose() @ApiProperty({ description: "Giá niêm yết trước khuyến mãi.", example: "15990000" }) originalPrice: string;
  @Expose() @ApiProperty({ description: "Giá hiện tại sau khuyến mãi nếu có.", example: "14990000" }) finalPrice: string;
  @Expose() @ApiPropertyOptional({ example: "4.5", nullable: true }) rate: string | null;
  @Expose() @ApiPropertyOptional({ description: "URL ảnh chính; null nếu sản phẩm chưa có ảnh.", nullable: true }) primaryImage: string | null;
  @Expose() @ApiProperty({ description: "Thời điểm tạo sản phẩm; dùng hiển thị mới đăng và lọc theo ngày.", type: String, format: "date-time" }) createdAt: Date;
}
