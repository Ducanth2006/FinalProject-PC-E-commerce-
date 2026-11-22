import { MetaDataEntity } from "@/common/entity/metaData.entity";
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";

@Entity("categories")
@Index("categories_slug_active_unique", ["slug"], {
  unique: true,
  where: '"deleted_at" IS NULL AND "is_active" = true',
})
export class Category extends MetaDataEntity {
  @PrimaryGeneratedColumn("increment", { type: "bigint" })
  id: string;

  @Column({ type: "varchar", length: 255 })
  name: string;

  @Column({ type: "bigint", nullable: true })
  parentId: string | null;

  @ManyToOne(() => Category, { nullable: true })
  @JoinColumn({ name: "parent_id" })
  parent: Category | null;

  @Column({ type: "varchar", length: 255 })
  slug: string;

}
