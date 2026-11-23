import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Matches, MaxLength } from 'class-validator';

export class QueryBrandDto {
  @ApiPropertyOptional({ description: 'Trang cần lấy, bắt đầu từ 1.', example: '1', default: '1', type: String })
  @IsOptional() @IsString() @Matches(/^[1-9]\d*$/) @MaxLength(10)
  page?: string;

  @ApiPropertyOptional({ description: 'Số thương hiệu trên mỗi trang, mặc định 10.', example: '20', default: '10', type: String })
  @IsOptional() @IsString() @Matches(/^[1-9]\d*$/) @MaxLength(10)
  pageSize?: string;

  @ApiPropertyOptional({ description: 'Tìm một phần tên thương hiệu, không phân biệt chữ hoa chữ thường.', example: 'sam' })
  @IsOptional() @IsString() @MaxLength(255)
  name?: string;
}
