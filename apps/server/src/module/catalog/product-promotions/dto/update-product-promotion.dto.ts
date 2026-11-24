import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsDateString, IsDefined, IsInt, IsOptional, IsString, Matches, Max, MaxLength, Min } from "class-validator";

export class UpdateProductPromotionDto {
  @ApiProperty({ description: "Phiên bản hiện tại của promotion.", example: 1, minimum: 1 })
  @IsDefined()
  @IsInt()
  @Min(1)
  version: number;

  @ApiPropertyOptional({ description: "Giá bán khuyến mãi, đơn vị đồng.", example: "12990000" })
  @IsOptional()
  @IsString()
  @Matches(/^[1-9]\d*$/)
  @MaxLength(19)
  salePrice?: string;

  @ApiPropertyOptional({ description: "Thời điểm bắt đầu, ISO 8601.", example: "2026-12-01T00:00:00.000Z" })
  @IsOptional()
  @IsDateString()
  startAt?: string;

  @ApiPropertyOptional({ description: "Thời điểm kết thúc, ISO 8601; phải sau startAt.", example: "2026-12-31T23:59:59.000Z" })
  @IsOptional()
  @IsDateString()
  endAt?: string;

  @ApiPropertyOptional({ description: "Tắt promotion để cho phép tạo đợt mới.", example: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
