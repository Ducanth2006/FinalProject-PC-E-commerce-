import { Product } from "@/module/catalog/products/entities/product.entity";
import { MetaDataEntity } from "@/common/entity/metaData.entity";
import {
  Check,
  Column,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";

@Entity("pc_bundle_components")
@Index("pc_bundle_components_component_id_idx", ["componentId"])
@Index("pc_bundle_components_active_pair_unique", ["pcId", "componentId"], {
  unique: true,
  where: '"deleted_at" IS NULL AND "is_active" = true',
})
@Check("pc_bundle_components_quantity_positive", '"quantity" > 0')
export class PcBundleComponent extends MetaDataEntity {
  @PrimaryGeneratedColumn("increment", { type: "bigint" })
  id: string;

  @Column({ type: "bigint" })
  pcId: string;

  @ManyToOne(() => Product, { nullable: false })
  pc: Product;

  @Column({ type: "bigint" })
  componentId: string;

  @ManyToOne(() => Product, { nullable: false })
  component: Product;

  @Column({ type: "int" })
  quantity: number;

}
