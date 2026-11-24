import { ApiProperty } from "@nestjs/swagger";
import { Exclude, Expose } from "class-transformer";

@Exclude()
export class ProductPromotionResponseDto {
  @Expose() @ApiProperty({ example: "1" }) id: string;
  @Expose() @ApiProperty({ example: "15" }) productId: string;
  @Expose() @ApiProperty({ example: "12990000" }) salePrice: string;
  @Expose() @ApiProperty({ type: String, format: "date-time" }) startAt: Date;
  @Expose() @ApiProperty({ type: String, format: "date-time" }) endAt: Date;
  @Expose() @ApiProperty({ example: true }) isActive: boolean;
  @Expose() @ApiProperty({ example: 1 }) version: number;
  @Expose() @ApiProperty({ type: String, format: "date-time" }) createdAt: Date;
  @Expose() @ApiProperty({ type: String, format: "uuid", nullable: true }) createdBy: string | null;
  @Expose() @ApiProperty({ type: String, format: "date-time" }) updatedAt: Date;
  @Expose() @ApiProperty({ type: String, format: "uuid", nullable: true }) updatedBy: string | null;
  @Expose() @ApiProperty({ type: String, format: "date-time", nullable: true }) deletedAt: Date | null;
  @Expose() @ApiProperty({ type: String, format: "uuid", nullable: true }) deletedBy: string | null;
}
