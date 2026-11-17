import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

import { WardType } from '../entities/ward.entity';

@Exclude()
export class ResponseWardDto {
  @ApiProperty({
    description: 'Unique identifier of the ward.',
    example: '12',
    type: String,
  })
  @Expose()
  id: string;

  @ApiProperty({
    description: 'Unique code of the ward.',
    example: '00012',
  })
  @Expose()
  code: string;

  @ApiProperty({
    description: 'Identifier of the province this ward belongs to.',
    example: '1',
    type: String,
  })
  @Expose()
  provinceId: string;

  @ApiProperty({
    description: 'Name of the ward.',
    example: 'Example Ward',
  })
  @Expose()
  name: string;

  @ApiProperty({
    description: 'Type of the ward.',
    enum: WardType,
    enumName: 'WardType',
    example: WardType.WARD,
  })
  @Expose()
  type: WardType;

  @ApiProperty({
    description: 'Whether the ward is active.',
    example: true,
  })
  @Expose()
  isActive: boolean;
}