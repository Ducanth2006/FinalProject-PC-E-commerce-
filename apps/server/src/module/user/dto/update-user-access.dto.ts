import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, ValidateIf } from 'class-validator';
import { roleEnum } from '@/module/roles/enums/roles.enum';
import { UserStatus } from '../enums/user-status.enum';

export class UpdateUserAccessDto {
  @ApiPropertyOptional({ description: 'Vai trò mới.', enum: roleEnum })
  @ValidateIf((_object, value) => value !== undefined)
  @IsEnum(roleEnum)
  roleId?: roleEnum;

  @ApiPropertyOptional({ description: 'Trạng thái tài khoản mới.', enum: UserStatus })
  @ValidateIf((_object, value) => value !== undefined)
  @IsEnum(UserStatus)
  status?: UserStatus;
}
