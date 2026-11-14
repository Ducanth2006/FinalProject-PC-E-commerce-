import { Role } from "../../roles/entities/role.entity";
import { UserGender } from "../enums/gender.enum";
import { UserStatus } from "../enums/user-status.enum";
import { MetaDataEntity } from "../../../common/entity/metaData.entity";
export declare class User extends MetaDataEntity {
    id: string;
    roleId: string;
    role: Role;
    email: string | null;
    phoneNumber: string | null;
    passwordHash: string | null;
    refreshTokenHash: string | null;
    googleId: string | null;
    fullName: string;
    avatarUrl: string | null;
    gender: UserGender | null;
    dateOfBirth: Date | null;
    status: UserStatus;
    lastLoginAt: Date | null;
    version: number;
}
