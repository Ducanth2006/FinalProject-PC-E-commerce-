import { MetaDataEntity } from "@/common/entity/metaData.entity";
import { Province } from "@/module/province/entities/province.entity";
import {
  Check,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";

export enum WardType {
  COMMUNE = "COMMUNE",
  WARD = "WARD",
  SPECIAL_ZONE = "SPECIAL_ZONE",
}

@Entity("ward")
@Check('"type" IN (\'COMMUNE\', \'WARD\', \'SPECIAL_ZONE\')')
export class Ward extends MetaDataEntity {
  @PrimaryGeneratedColumn("identity", { type: "bigint" })
  id: string;

  @Column({ type: "varchar", length: 20, unique: true })
  code: string;

  @Column({ type: "bigint" })
  provinceId: string;

  @ManyToOne(() => Province, (province) => province.wards, {
    nullable: false,
  })
  @JoinColumn({ name: "province_id" })
  province: Province;

  @Column({ type: "varchar", length: 50 })
  name: string;

  @Column({ type: "varchar", length: 20 })
  type: WardType;

}