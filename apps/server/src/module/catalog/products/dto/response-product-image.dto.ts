import { ApiProperty } from "@nestjs/swagger";
import { Exclude, Expose } from "class-transformer";

@Exclude()
export class ProductImageResponseDto {
  @Expose() @ApiProperty({ example: "8" }) id: string;
  @Expose() @ApiProperty({ example: "15" }) productId: string;
  @Expose() @ApiProperty({ example: "/images/rtx-5070-front.webp" }) imgUrl: string;
  @Expose() @ApiProperty({ type: String, nullable: true }) altText: string | null;
  @Expose() @ApiProperty({ example: true }) isPrimary: boolean;
  @Expose() @ApiProperty({ example: 0 }) displayOrder: number;
}
