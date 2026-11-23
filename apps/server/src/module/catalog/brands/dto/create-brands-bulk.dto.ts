import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMaxSize, ArrayNotEmpty, IsArray, IsDefined, IsObject, ValidateNested } from 'class-validator';
import { CreateBrandDto } from './create-brand.dto';

export class CreateBrandsBulkDto {
  @ApiProperty({ description: 'Danh sách từ 1 đến 100 thương hiệu cần tạo.', type: [CreateBrandDto], example: [{ name: 'Samsung' }, { name: 'Asus' }], minItems: 1, maxItems: 100 })
  @IsDefined()
  @IsArray()
  @ArrayNotEmpty()
  @ArrayMaxSize(100)
  @IsObject({ each: true })
  @ValidateNested({ each: true })
  @Type(() => CreateBrandDto)
  brands: CreateBrandDto[];
}
