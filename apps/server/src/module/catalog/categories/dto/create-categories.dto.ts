import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMaxSize, ArrayNotEmpty, IsArray, IsDefined, IsObject, ValidateNested } from 'class-validator';
import { CreateCategoryDto } from './create-category.dto';

export class CreateCategoriesDto {
  @ApiProperty({ description: 'Danh sách từ 1 đến 100 danh mục.', type: [CreateCategoryDto], minItems: 1, maxItems: 100, example: [{ name: 'Linh kiện' }, { name: 'RAM', parentId: '1' }] })
  @IsDefined()
  @IsArray()
  @ArrayNotEmpty()
  @ArrayMaxSize(100)
  @IsObject({ each: true })
  @ValidateNested({ each: true })
  @Type(() => CreateCategoryDto)
  categories: CreateCategoryDto[];
}
