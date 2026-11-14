import { Exclude, Expose, Type } from 'class-transformer';
import { UserGender } from '../enums/gender.enum';
import { UserStatus } from '../enums/user-status.enum';

@Exclude() // Ẩn tất cả các trường mặc định, chỉ trả về các trường có @Expose()
export class UserResponseDto {
  @Expose()
  id: string;

  @Expose()
  email: string | null;

  @Expose()
  phoneNumber: string | null;

  @Expose()
  fullName: string;

  @Expose()
  avatarUrl: string | null;

  @Expose()
  gender: UserGender | null;

  @Expose()
  dateOfBirth: Date | null;

  @Expose()
  status: UserStatus;

  @Expose()
  roleId: string;

  @Expose()
  lastLoginAt: Date | null;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  
}