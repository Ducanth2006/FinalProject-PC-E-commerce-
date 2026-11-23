import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDefined, IsOptional, IsString, Matches, MaxLength } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ description: 'Tên danh mục; backend tự tạo slug.', example: 'Linh kiện máy tính', maxLength: 255 })
  @IsDefined()
  @IsString()
  @Matches(/\S/, { message: 'Tên danh mục không được để trống' })
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({ description: 'ID danh mục cha; bỏ qua hoặc null nếu là danh mục gốc.', example: '1', type: String, nullable: true })
  @IsOptional()
  @IsString()
  @Matches(/^[1-9]\d*$/, { message: 'parentId phải là chuỗi số nguyên dương' })
  @MaxLength(19)
  parentId?: string | null;
}
