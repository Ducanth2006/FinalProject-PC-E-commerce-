import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class BrandResponseDto {
  @Expose()
  @ApiProperty({ description: 'ID thương hiệu (bigint dưới dạng chuỗi).', example: '1' })
  id: string;

  @Expose()
  @ApiProperty({ description: 'Tên thương hiệu.', example: 'Samsung' })
  name: string;

  @Expose()
  @ApiProperty({ description: 'Slug do backend tạo.', example: 'samsung' })
  slug: string;

  @Expose()
  @ApiProperty({ description: 'Phiên bản bản ghi.', example: 1 })
  version: number;

  @Expose()
  @ApiProperty({ description: 'Trạng thái hoạt động.', example: true })
  isActive: boolean;

  @Expose()
  @ApiProperty({ description: 'Thời điểm tạo.', type: String, format: 'date-time' })
  createdAt: Date;

  @Expose()
  @ApiProperty({ description: 'ID người tạo.', type: String, format: 'uuid', nullable: true })
  createdBy: string | null;

  @Expose()
  @ApiProperty({ description: 'Thời điểm cập nhật gần nhất.', type: String, format: 'date-time' })
  updatedAt: Date;

  @Expose()
  @ApiProperty({ description: 'ID người cập nhật gần nhất.', type: String, format: 'uuid', nullable: true })
  updatedBy: string | null;

  @Expose()
  @ApiProperty({ description: 'Thời điểm xóa mềm.', type: String, format: 'date-time', nullable: true })
  deletedAt: Date | null;

  @Expose()
  @ApiProperty({ description: 'ID người xóa mềm.', type: String, format: 'uuid', nullable: true })
  deletedBy: string | null;
}
