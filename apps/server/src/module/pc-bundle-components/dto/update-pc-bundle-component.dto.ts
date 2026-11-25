import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class UpdatePcBundleComponentDto {
  @ApiPropertyOptional({ example: 2, minimum: 1, maximum: 100 })
  @IsOptional() @IsInt() @Min(1) @Max(100)
  quantity?: number;

}
