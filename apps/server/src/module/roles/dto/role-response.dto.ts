import { ApiProperty } from '@nestjs/swagger';
import { roleEnum } from '../enums/roles.enum';
import { Expose } from 'class-transformer';

export class RoleResponseDto {
  @ApiProperty({ enum: roleEnum, example: roleEnum.CLIENT })
  @Expose()
  id: roleEnum;

  @ApiProperty({ example: 'Khách hàng' })
  @Expose()
  name: string;

  @ApiProperty({ example: 'Tài khoản mua hàng trên hệ thống', nullable: true })
  @Expose()
  description?: string;
}
