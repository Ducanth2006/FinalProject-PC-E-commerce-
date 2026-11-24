import { Brand } from "@/module/catalog/brands/entities/brand.entity";
import { Category } from "@/module/catalog/categories/entities/category.entity";
import { MetaDataEntity } from "@/common/entity/metaData.entity";
import {
  Check,
  Column,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { ProductImage } from "./product-image.entity";
import { ProductPromotion } from "@/module/catalog/product-promotions/entities/product-promotion.entity";

export enum ProductType {
  COMPONENT = "COMPONENT",
  PC_BUNDLE = "PC_BUNDLE",
}

@Entity("products")
@Index("products_slug_active_unique", ["slug"], {
  unique: true,
  where: '"deleted_at" IS NULL AND "is_active" = true',
})
@Index("products_sku_active_unique", ["sku"], {
  unique: true,
  where: '"deleted_at" IS NULL AND "is_active" = true',
})
@Index("products_category_id_idx", ["categoryId"])
@Index("products_brand_id_idx", ["brandId"])
@Check("products_price_positive", '"price" > 0')
@Check("products_rate_range", '"rate" IS NULL OR ("rate" >= 0 AND "rate" <= 5)')
export class Product extends MetaDataEntity {
  @PrimaryGeneratedColumn("increment", { type: "bigint" })
  id: string;

  @Column({ type: "varchar", length: 255 })
  slug: string;

  @Column({ type: "varchar", length: 255 })
  sku: string;

  @Column({ type: "text" })
  name: string;

  @Column({ type: "enum", enum: ProductType })
  type: ProductType;

  @Column({ type: "bigint" })
  categoryId: string;

  @ManyToOne(() => Category, { nullable: false })
  category: Category;

  @Column({ type: "bigint" })
  brandId: string;

  @ManyToOne(() => Brand, { nullable: false })
  brand: Brand;

  @Column({ type: "jsonb", default: () => "'{}'::jsonb" })
  specs: Record<string, unknown>;

  @Column({ type: "text", nullable: true })
  description: string | null;

  @Column({ type: "numeric", precision: 2, scale: 1, nullable: true })
  rate: string | null;

  @Column({ type: "bigint" })
  price: string;

  @OneToMany(() => ProductImage, (productImage) => productImage.product)
  images: ProductImage[];

  @OneToMany(() => ProductPromotion, (promotion) => promotion.product)
  promotions: ProductPromotion[];

}
