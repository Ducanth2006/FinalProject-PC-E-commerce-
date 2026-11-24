import { MetaDataEntity } from "@/common/entity/metaData.entity";
import { Column, Entity, Index, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Product } from "./product.entity";

@Entity("product_images")
@Index("product_images_product_display_order_idx", ["productId", "displayOrder"])
@Index("product_images_one_primary_per_product_unique", ["productId"], {
  unique: true,
  where: '"is_primary" = true AND "deleted_at" IS NULL AND "is_active" = true',
})
export class ProductImage extends MetaDataEntity {
  @PrimaryGeneratedColumn("increment", { type: "bigint" })
  id: string;

  @Column({ type: "bigint" })
  productId: string;

  @ManyToOne(() => Product, (product) => product.images, { nullable: false })
  product: Product;

  @Column({ type: "text" })
  imgUrl: string;

  @Column({ type: "text", nullable: true })
  altText: string | null;

  @Column({ type: "boolean", default: false })
  isPrimary: boolean;

  @Column({ type: "int", default: 0 })
  displayOrder: number;
}
