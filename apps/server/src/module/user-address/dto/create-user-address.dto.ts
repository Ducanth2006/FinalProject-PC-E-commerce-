import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDefined,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
} from 'class-validator';

export class CreateUserAddressDto {
  @ApiProperty({
    description: 'UUID of the user who owns this address.',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsDefined()
  @IsUUID()
  userId: string;

  @ApiPropertyOptional({
    description: 'Province ID as a positive integer.',
    example: '1',
    type: String,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  @Matches(/^[1-9]\d*$/, {
    message: 'provinceId must be a positive integer string',
  })
  provinceId?: string | null;

  @ApiPropertyOptional({
    description: 'Ward ID as a positive integer.',
    example: '12',
    type: String,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  @Matches(/^[1-9]\d*$/, {
    message: 'wardId must be a positive integer string',
  })
  wardId?: string | null;

  @ApiPropertyOptional({
    description: 'Street, building, or other address details.',
    example: '123 Example Street, Apartment 4B',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  addressDetail?: string | null;

  @ApiPropertyOptional({
    description: 'Whether this is the default address. Defaults to false.',
    example: false,
    default: false,
  })
 
  @IsBoolean()
  isDefault = false;
}
