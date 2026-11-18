import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from './response-user.dto';

export class PaginatedUserDto {
  @ApiProperty({ type: () => [UserResponseDto] })
  data: UserResponseDto[];

  @ApiProperty({ example: 25 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 3 })
  totalPages: number;
}
