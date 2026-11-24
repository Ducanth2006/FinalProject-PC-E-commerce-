import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsInt, IsOptional, IsString, Max, MaxLength, Min, ValidateIf } from "class-validator";

export class CreateProductImageDto {
  @ApiProperty({ description: "URL hoặc path ảnh đã có sẵn.", example: "/images/rtx-5070-front.webp", maxLength: 2048 })
  @IsString()
  @MaxLength(2048)
  imgUrl: string;

  @ApiPropertyOptional({ description: "Văn bản thay thế cho ảnh.", example: "Mặt trước card RTX 5070" })
  @ValidateIf((_object, value) => value !== undefined && value !== null)
  @IsString()
  @MaxLength(500)
  altText?: string | null;

  @ApiPropertyOptional({ description: "Đánh dấu ảnh đại diện. Nếu bỏ qua, ảnh đầu tiên là ảnh đại diện.", default: false })
  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;

  @ApiPropertyOptional({ description: "Thứ tự hiển thị; mặc định theo vị trí trong danh sách.", minimum: 0, maximum: 2147483647 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(2147483647)
  displayOrder?: number;
}
