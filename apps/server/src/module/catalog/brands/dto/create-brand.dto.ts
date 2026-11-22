import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsString, Matches } from 'class-validator';

export class CreateBrandDto {
  @ApiProperty({
    description: 'Tên thương hiệu; slug sẽ được backend tạo từ tên.',
    example: 'Samsung',
  })
  @IsDefined()
  @IsString()
  @Matches(/\S/, { message: 'Tên thương hiệu không được để trống' })
  name: string;
}
