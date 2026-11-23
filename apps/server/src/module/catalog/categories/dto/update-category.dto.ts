import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDefined, IsInt, IsOptional, IsString, Matches, MaxLength, Min, ValidateIf } from 'class-validator';

export class UpdateCategoryDto {
  @ApiProperty({ description: 'Phiên bản hiện tại của danh mục.', example: 1, minimum: 1 })
  @IsDefined() @IsInt() @Min(1)
  version: number;

  @ApiPropertyOptional({ description: 'Tên mới; slug được tạo lại từ tên.', example: 'Linh kiện', maxLength: 255 })
  @ValidateIf((_object, value) => value !== undefined)
  @IsString() @Matches(/\S/) @MaxLength(255)
  name?: string;

  @ApiPropertyOptional({ description: 'ID danh mục cha mới; null để chuyển thành danh mục gốc.', type: String, nullable: true, example: '1' })
  @IsOptional() @IsString() @Matches(/^[1-9]\d*$/) @MaxLength(19)
  parentId?: string | null;
}
