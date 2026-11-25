import { Product } from '@/module/catalog/products/entities/product.entity';
import { MetaDataEntity } from '@/common/entity/metaData.entity';
import { Check, Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';

@Entity('inventory')
@Check('inventory_quantity_non_negative', '"quantity" >= 0')
@Check('inventory_reserved_quantity_non_negative', '"reserved_quantity" >= 0')
@Check('inventory_reserved_quantity_within_stock', '"reserved_quantity" <= "quantity"')
export class Inventory extends MetaDataEntity {
  @PrimaryColumn({ type: 'bigint' })
  productId: string;

  @OneToOne(() => Product, { nullable: false })
  @JoinColumn({ name: 'product_id', referencedColumnName: 'id' })
  product: Product;

  @Column({ type: 'int', default: 0 })
  quantity: number;

  @Column({ type: 'int', default: 0 })
  reservedQuantity: number;
}
