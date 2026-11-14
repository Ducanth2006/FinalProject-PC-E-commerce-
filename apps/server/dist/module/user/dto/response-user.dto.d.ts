import { UserGender } from '../enums/gender.enum';
import { UserStatus } from '../enums/user-status.enum';
export declare class UserResponseDto {
    id: string;
    email: string | null;
    phoneNumber: string | null;
    fullName: string;
    avatarUrl: string | null;
    gender: UserGender | null;
    dateOfBirth: Date | null;
    status: UserStatus;
    roleId: string;
    lastLoginAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}
