import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, IsUrl, Matches, MaxLength, ValidateIf } from 'class-validator';
import { UserGender } from '../enums/gender.enum';

export class UpdateClientProfileDto {
  @ApiPropertyOptional({ example: 'user@example.com', maxLength: 255, description: 'Email address; cannot be null.' })
  @ValidateIf((_object, value) => value !== undefined)
  @IsEmail()
  @MaxLength(255)
  email?: string;

  @ApiPropertyOptional({ example: '+84912345678', maxLength: 20, nullable: true, description: 'Phone number; use null to clear it.' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  @Matches(/^\+?[0-9]{1,19}$/, { message: 'phoneNumber must contain digits and may start with +' })
  phoneNumber?: string | null;

  @ApiPropertyOptional({ example: 'Nguyen Van An', maxLength: 100 })
  @ValidateIf((_object, value) => value !== undefined)
  @IsString()
  @IsNotEmpty()
  @Matches(/\S/, { message: 'fullName must not be blank' })
  @MaxLength(100)
  fullName?: string;

  @ApiPropertyOptional({ example: 'https://example.com/avatar.jpg', nullable: true, description: 'Avatar URL; use null to clear it.' })
  @IsOptional()
  @IsUrl({ protocols: ['http', 'https'], require_protocol: true })
  avatarUrl?: string | null;

  @ApiPropertyOptional({ enum: UserGender, enumName: 'UserGender', nullable: true, description: 'Gender; use null to clear it.' })
  @IsOptional()
  @IsEnum(UserGender)
  gender?: UserGender | null;

  @ApiPropertyOptional({ example: '2000-01-31', format: 'date', nullable: true, description: 'Date of birth in YYYY-MM-DD format; use null to clear it.' })
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'dateOfBirth must be in YYYY-MM-DD format' })
  @IsDateString({ strict: true })
  dateOfBirth?: string | null;
}
