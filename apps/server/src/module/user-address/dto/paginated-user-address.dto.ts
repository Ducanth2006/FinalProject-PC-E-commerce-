import { ApiProperty } from '@nestjs/swagger';
import { UserAddressResponseDto } from './response-user-address.dto';

export class PaginatedUserAddressDto {
  @ApiProperty({ type: () => [UserAddressResponseDto] })
  data: UserAddressResponseDto[];

  @ApiProperty({ example: 12, description: 'Total matching addresses' })
  total: number;

  @ApiProperty({ example: 1, description: 'Current page, starting at 1' })
  page: number;

  @ApiProperty({ example: 3, description: 'Total pages; 0 when no addresses match' })
  totalPages: number;
}
