import { Column, Entity, PrimaryColumn } from "typeorm";
import {roleEnum} from "@/module/roles/enums/roles.enum"
import { MetaDataEntity } from "@/common/entity/metaData.entity";

@Entity("roles")
export class Role extends MetaDataEntity{
    @PrimaryColumn({type:"varchar",length:50})
    id:roleEnum
    @Column({type:"varchar",length:100})
    name:string
    @Column({type:"text",nullable:true})
    description:string
}
