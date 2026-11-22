import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsInt, Min } from 'class-validator';
import { CreateBrandDto } from './create-brand.dto';

export class UpdateBrandDto extends CreateBrandDto {
  @ApiProperty({ description: 'Phiên bản hiện tại của thương hiệu.', example: 1, minimum: 1 })
  @IsDefined()
  @IsInt()
  @Min(1)
  version: number;
}
