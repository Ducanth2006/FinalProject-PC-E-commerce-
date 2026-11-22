import { Product } from "@/module/catalog/products/entities/product.entity";
import { MetaDataEntity } from "@/common/entity/metaData.entity";
import {
  Check,
  Column,
  Entity,
  Index,
  ManyToOne,
  PrimaryColumn,
} from "typeorm";

@Entity("pc_bundle_components")
@Index("pc_bundle_components_component_id_idx", ["componentId"])
@Check("pc_bundle_components_quantity_positive", '"quantity" > 0')
export class PcBundleComponent extends MetaDataEntity {
  @PrimaryColumn({ type: "bigint" })
  pcId: string;

  @ManyToOne(() => Product, { nullable: false })
  pc: Product;

  @PrimaryColumn({ type: "bigint" })
  componentId: string;

  @ManyToOne(() => Product, { nullable: false })
  component: Product;

  @Column({ type: "int" })
  quantity: number;

}
