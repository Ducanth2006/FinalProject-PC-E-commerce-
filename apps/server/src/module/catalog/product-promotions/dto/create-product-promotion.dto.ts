import { ApiProperty } from "@nestjs/swagger";
import { IsDateString, IsDefined, IsString, Matches, MaxLength } from "class-validator";

export class CreateProductPromotionDto {
  @ApiProperty({ description: "ID sản phẩm áp dụng khuyến mãi.", example: "15" })
  @IsDefined()
  @IsString()
  @Matches(/^[1-9]\d*$/)
  @MaxLength(19)
  productId: string;

  @ApiProperty({ description: "Giá bán khuyến mãi, đơn vị đồng.", example: "12990000" })
  @IsDefined()
  @IsString()
  @Matches(/^[1-9]\d*$/)
  @MaxLength(19)
  salePrice: string;

  @ApiProperty({ description: "Thời điểm bắt đầu, ISO 8601.", example: "2026-12-01T00:00:00.000Z" })
  @IsDefined()
  @IsDateString()
  startAt: string;

  @ApiProperty({ description: "Thời điểm kết thúc, ISO 8601; phải sau startAt.", example: "2026-12-31T23:59:59.000Z" })
  @IsDefined()
  @IsDateString()
  endAt: string;
}
