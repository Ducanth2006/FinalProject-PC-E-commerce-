import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class ResponseProvinceDto {
  @ApiProperty({
    description: 'Unique identifier of the province.',
    example: '1',
    type: String,
  })
  @Expose()
  id: string;

  @ApiProperty({
    description: 'Unique code of the province.',
    example: '01',
  })
  @Expose()
  code: string;

  @ApiProperty({
    description: 'Name of the province.',
    example: 'Example Province',
  })
  @Expose()
  name: string;

  @ApiProperty({
    description: 'Whether the province is active.',
    example: true,
  })
  @Expose()
  isActive: boolean;
}
