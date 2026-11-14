import { roleEnum } from "../enums/roles.enum";
import { MetaDataEntity } from "../../../common/entity/metaData.entity";
export declare class Role extends MetaDataEntity {
    id: roleEnum;
    name: string;
    description: string;
}
