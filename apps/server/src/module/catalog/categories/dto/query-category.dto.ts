import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Matches, MaxLength } from 'class-validator';

export class QueryCategoryDto {
  @ApiPropertyOptional({ description: 'Trang cần lấy, bắt đầu từ 1.', example: '1', default: '1', type: String })
  @IsOptional()
  @IsString()
  @Matches(/^[1-9]\d*$/)
  @MaxLength(10)
  page?: string;

  @ApiPropertyOptional({ description: 'Số danh mục trên mỗi trang, mặc định 10.', example: '20', default: '10', type: String })
  @IsOptional()
  @IsString()
  @Matches(/^[1-9]\d*$/)
  @MaxLength(10)
  pageSize?: string;

  @ApiPropertyOptional({ description: 'Tìm một phần tên danh mục, không phân biệt chữ hoa chữ thường.', example: 'linh' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @ApiPropertyOptional({ description: 'Slug chính xác của danh mục.', example: 'ram' })
  @IsOptional()
  @IsString()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  @MaxLength(255)
  slug?: string;

  @ApiPropertyOptional({ description: 'Slug chính xác của danh mục cha đang hoạt động.', example: 'linh-kien' })
  @IsOptional()
  @IsString()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  @MaxLength(255)
  parentSlug?: string;
}
