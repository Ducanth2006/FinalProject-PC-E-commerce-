import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsString, Matches } from 'class-validator';

export class CreateBrandDto {
  @ApiProperty({
    description: 'Tên thương hiệu; slug sẽ được backend tạo từ tên.',
    example: 'Samsung',
  })
  @IsDefined()
  @IsString()
  @Matches(/\S/, { message: 'Brand name must not be blank' })
  name: string;
}
