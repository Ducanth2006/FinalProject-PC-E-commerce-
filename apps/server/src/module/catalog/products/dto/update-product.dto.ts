import { OmitType, PartialType } from '@nestjs/mapped-types';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsDefined,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { CreateProductDto } from './create-product.dto';

export class UpdateProductImageDto {
  @ApiPropertyOptional({ example: '8', description: 'Existing image ID; omit it to create a new image.' })
  @IsOptional()
  @IsString()
  @Matches(/^[1-9]\d*$/)
  @MaxLength(19)
  id?: string;

  @ApiPropertyOptional({ description: 'Set true to soft-delete this existing image.' })
  @IsOptional()
  @IsBoolean()
  isDeleted?: boolean;

  @ApiPropertyOptional({ example: '/images/rtx-5070-front.webp', maxLength: 2048 })
  @ValidateIf((image: UpdateProductImageDto, value) =>
    (image.id === undefined && image.isDeleted !== true) || value !== undefined)
  @IsDefined()
  @IsString()
  @MaxLength(2048)
  imgUrl?: string;

  @ApiPropertyOptional({ example: 'Front view of the graphics card.', nullable: true })
  @ValidateIf((_image, value) => value !== undefined && value !== null)
  @IsString()
  @MaxLength(500)
  altText?: string | null;

  @ApiPropertyOptional({ description: 'Mark this image as the product primary image.' })
  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;

  @ApiPropertyOptional({ minimum: 0, maximum: 2147483647 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(2147483647)
  displayOrder?: number;
}

class UpdateProductFieldsDto extends PartialType(OmitType(CreateProductDto, ['images'] as const)) {}

export class UpdateProductDto extends UpdateProductFieldsDto {
  @ApiPropertyOptional({ description: 'Phiên bản hiện tại của sản phẩm.', example: 1, minimum: 1 })
  @IsDefined()
  @IsInt()
  @Min(1)
  version: number;

  @ApiPropertyOptional({ type: [UpdateProductImageDto], maxItems: 10 })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @ValidateNested({ each: true })
  @Type(() => UpdateProductImageDto)
  images?: UpdateProductImageDto[];
}
