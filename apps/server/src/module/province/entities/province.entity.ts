import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Ward } from "@/module/ward/entities/ward.entity";
import { MetaDataEntity } from "@/common/entity/metaData.entity";

@Entity("province")
export class Province extends MetaDataEntity {
  @PrimaryGeneratedColumn("identity", { type: "bigint" })
  id: string;

  @Column({ type: "varchar", length: 20, unique: true })
  code: string;

  @Column({ type: "varchar", length: 50 })
  name: string;

 

  @OneToMany(() => Ward, (ward) => ward.province)
  wards: Ward[];
}