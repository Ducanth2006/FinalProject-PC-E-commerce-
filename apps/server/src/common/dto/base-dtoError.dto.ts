// src/common/dto/base-error.dto.ts
import { ApiProperty } from '@nestjs/swagger';

/* --------------------------  Base (cấu trúc chung) -------------------------- */
export class BaseErrorDto {
  @ApiProperty({ example: 404 })
  statusCode: number;

  // Không đặt example ở đây → Swagger sẽ hiển thị “example” trống,
  // còn runtime bạn tự truyền bất kỳ chuỗi nào.
  @ApiProperty({ description: 'Mô tả lỗi (được truyền động)' })
  message: string;

  @ApiProperty({ example: 'Not Found' })
  error: string;
}