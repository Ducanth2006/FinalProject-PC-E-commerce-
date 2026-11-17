import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';

import { ResponseProvinceDto } from '@/module/province/dto/response-province.dto';
import { ResponseWardDto } from '@/module/ward/dto/response-ward.dto';

@Exclude()
export class UserAddressResponseDto {
  @ApiProperty({
    description: 'Unique identifier of the user address.',
    example: '550e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
  })
  @Expose()
  id: string;

  @ApiProperty({
    description: 'UUID of the user who owns this address.',
    example: 'a8098c1a-f86e-11da-bd1a-00112444be1e',
    format: 'uuid',
  })
  @Expose()
  userId: string;

  @ApiPropertyOptional({
    description: 'Province associated with this address.',
    type: () => ResponseProvinceDto,
    nullable: true,
  })
  @Expose()
  @Type(() => ResponseProvinceDto)
  province: ResponseProvinceDto | null;

  @ApiPropertyOptional({
    description: 'Ward associated with this address.',
    type: () => ResponseWardDto,
    nullable: true,
  })
  @Expose()
  @Type(() => ResponseWardDto)
  ward: ResponseWardDto | null;

  @ApiPropertyOptional({
    description: 'Street, building, or other address details.',
    example: '123 Example Street, Apartment 4B',
    nullable: true,
  })
  @Expose()
  addressDetail: string | null;

  @ApiProperty({
    description: 'Whether this is the default address.',
    example: false,
    default: false,
  })
  @Expose()
  isDefault: boolean;

  @ApiProperty({
    description: 'Whether this address is active.',
    example: true,
  })
  @Expose()
  isActive: boolean;

  @ApiProperty({
    description: 'Date and time when this address was created.',
    example: '2026-11-15T08:30:00.000Z',
    format: 'date-time',
  })
  @Expose()
  createdAt: Date;

  @ApiPropertyOptional({
    description: 'UUID of the user who created this address.',
    example: null,
    format: 'uuid',
    nullable: true,
  })
  @Expose()
  createdBy: string | null;

  @ApiProperty({
    description: 'Date and time when this address was last updated.',
    example: '2026-11-15T08:30:00.000Z',
    format: 'date-time',
  })
  @Expose()
  updatedAt: Date;

  @ApiPropertyOptional({
    description: 'UUID of the user who last updated this address.',
    example: null,
    format: 'uuid',
    nullable: true,
  })
  @Expose()
  updatedBy: string | null;

  @ApiPropertyOptional({
    description: 'Date and time when this address was deleted.',
    example: null,
    format: 'date-time',
    nullable: true,
  })
  @Expose()
  deletedAt: Date | null;

  @ApiPropertyOptional({
    description: 'UUID of the user who deleted this address.',
    example: null,
    format: 'uuid',
    nullable: true,
  })
  @Expose()
  deletedBy: string | null;
}
