import { MetaDataEntity } from "@/common/entity/metaData.entity";
import {
  Check,
  Column,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  VersionColumn,
} from "typeorm";
import { Product } from "@/module/catalog/products/entities/product.entity";

@Entity("product_promotions")
@Index("product_promotions_product_end_at_idx", ["productId", "endAt"])
@Check("product_promotions_sale_price_positive", '"sale_price" > 0')
@Check("product_promotions_valid_period", '"start_at" < "end_at"')
export class ProductPromotion extends MetaDataEntity {
  @PrimaryGeneratedColumn("increment", { type: "bigint" })
  id: string;

  @Column({ type: "bigint" })
  productId: string;

  @ManyToOne(() => Product, (product) => product.promotions, { nullable: false })
  product: Product;

  @Column({ type: "bigint" })
  salePrice: string;

  @Column({ type: "timestamptz" })
  startAt: Date;

  @Column({ type: "timestamptz" })
  endAt: Date;

  @VersionColumn()
  version: number;
}
