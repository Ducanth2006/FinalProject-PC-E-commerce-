import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class CategoryResponseDto {
  @Expose()
  @ApiProperty({ description: 'ID danh mục dưới dạng chuỗi.', example: '1' })
  id: string;

  @Expose()
  @ApiProperty({ description: 'Tên danh mục.', example: 'Linh kiện máy tính' })
  name: string;

  @Expose()
  @ApiProperty({ description: 'Slug do backend tạo.', example: 'linh-kien-may-tinh' })
  slug: string;

  @Expose()
  @ApiProperty({ description: 'ID danh mục cha; null nếu là danh mục gốc.', type: String, nullable: true, example: '1' })
  parentId: string | null;

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
