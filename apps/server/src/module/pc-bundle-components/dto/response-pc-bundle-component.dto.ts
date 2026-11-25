import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class PcBundleComponentResponseDto {
  @Expose() @ApiProperty({ example: '23' }) componentId: string;
  @Expose() @ApiProperty({ example: 'AMD Ryzen 5 5500' }) name: string;
  @Expose() @ApiProperty({ example: 'AMD-R5-5500' }) sku: string;
  @Expose() @ApiProperty({ type: 'object', additionalProperties: true }) specs: Record<string, unknown>;
  @Expose() @ApiProperty({ example: 1 }) quantity: number;
  @Expose() @ApiProperty({ example: 36, nullable: true }) warrantyMonths: number | null;
}
