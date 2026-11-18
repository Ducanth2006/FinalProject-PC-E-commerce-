import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
import { roleEnum } from '../../roles/enums/roles.enum';
import { UserGender } from '../enums/gender.enum';
import { UserStatus } from '../enums/user-status.enum';

export class FindUsersDto {
  @ApiPropertyOptional({ default: 1, minimum: 1, maximum: 214748365 })
  @Transform(({ value }) => typeof value === 'string' && /^[1-9]\d*$/.test(value) ? Number(value) : value)
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(214748365)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Search email, phone number or full name' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;

  @ApiPropertyOptional({ enum: roleEnum })
  @IsOptional()
  @IsEnum(roleEnum)
  role?: roleEnum;

  @ApiPropertyOptional({ enum: UserGender })
  @IsOptional()
  @IsEnum(UserGender)
  gender?: UserGender;

  @ApiPropertyOptional({ enum: UserStatus })
  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;


}
