import { MetaDataEntity } from "@/common/entity/metaData.entity";
import { Column, Entity, Index, PrimaryGeneratedColumn, VersionColumn } from "typeorm";

@Entity("brands")
@Index("brands_name_not_deleted_unique", ["name"], { unique: true, where: '"deleted_at" IS NULL and "is_active" = true' })
@Index("brands_slug_not_deleted_unique", ["slug"], { unique: true, where: '"deleted_at" IS NULL and "is_active" = true' })
export class Brand extends MetaDataEntity {
  @PrimaryGeneratedColumn("increment", { type: "bigint" })
  id: string;

  @Column({ type: "text" })
  name: string;

  @Column({ type: "varchar", length: 255 })
  slug: string;

  @VersionColumn()
  version: number;

}
