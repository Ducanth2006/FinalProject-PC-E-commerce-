import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString, Matches, MaxLength } from "class-validator";

export class QueryProductPromotionDto {
  @ApiPropertyOptional({ description: "Lọc theo ID sản phẩm.", example: "15" })
  @IsOptional()
  @IsString()
  @Matches(/^[1-9]\d*$/)
  @MaxLength(19)
  productId?: string;

  @ApiPropertyOptional({ description: "Tìm promotion theo một phần slug sản phẩm, không phân biệt hoa thường.", example: "rtx-5070" })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  productSlug?: string;

  @ApiPropertyOptional({ description: "Trang cần lấy, bắt đầu từ 1.", example: "1", default: "1" })
  @IsOptional()
  @IsString()
  @Matches(/^[1-9]\d*$/)
  @MaxLength(10)
  page?: string;

  @ApiPropertyOptional({ description: "Số bản ghi mỗi trang.", example: "10", default: "10" })
  @IsOptional()
  @IsString()
  @Matches(/^[1-9]\d*$/)
  @MaxLength(10)
  pageSize?: string;
}
