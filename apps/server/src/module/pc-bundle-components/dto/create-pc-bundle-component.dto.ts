import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsInt, IsString, Matches, Max, MaxLength, Min } from 'class-validator';

export class CreatePcBundleComponentDto {
  @ApiProperty({ example: '15', description: 'ID của sản phẩm PC_BUNDLE.' })
  @IsDefined() @IsString() @Matches(/^[1-9]\d*$/) @MaxLength(19)
  pcId: string;

  @ApiProperty({ example: '23', description: 'ID của product linh kiện COMPONENT.' })
  @IsDefined() @IsString() @Matches(/^[1-9]\d*$/) @MaxLength(19)
  componentId: string;

  @ApiProperty({ example: 1, minimum: 1 })
  @IsDefined() @IsInt() @Min(1) @Max(100)
  quantity: number;

}
