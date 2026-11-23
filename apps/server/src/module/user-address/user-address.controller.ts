import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards, ParseUUIDPipe, Query, DefaultValuePipe, ParseIntPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { applyDecorators } from '@nestjs/common';
import { UserAddressService } from './user-address.service';
import { CreateUserAddressDto } from './dto/create-user-address.dto';
import { UpdateUserAddressDto } from './dto/update-user-address.dto';
import { AuthenticatedUser } from '@/common/types/authenticated-user.type';
import { RolesGuard } from '@/common/guard/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { roleEnum } from '../roles/enums/roles.enum';
import { UserAddressResponseDto } from './dto/response-user-address.dto';
import { ApiPaginatedResponse } from '@/common/decorators/api-paginated-response.decorator';

const ErrorResponse = (status: number, description: string, message: string | string[]) =>
  ApiResponse({ status, description, schema: { example: { statusCode: status, message, error: ({ 400: 'Bad Request', 401: 'Unauthorized', 403: 'Forbidden', 404: 'Not Found', 409: 'Conflict' })[status] } } });
const AuthErrors = () => applyDecorators(ErrorResponse(401, 'Missing or invalid access token.', 'Unauthorized'));
const AddressId = () => ApiParam({ name: 'id', type: String, format: 'uuid', description: 'Address UUID.' });
const PageQuery = () => ApiQuery({ name: 'page', required: false, type: Number, example: 1, description: 'Page number, starting at 1. Each page contains up to 5 addresses.' });

@ApiTags('User addresses')
@Controller('user-address')
export class UserAddressController {
  constructor(private readonly userAddressService: UserAddressService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create an address for the authenticated user' })
  @ApiBody({ type: CreateUserAddressDto })
  @ApiResponse({ status: 201, description: 'Address created successfully.', type: UserAddressResponseDto })
  @AuthErrors()
  @ErrorResponse(400, 'Invalid input or ward does not belong to the province.', 'Ward does not belong to province')
  @ErrorResponse(403, 'The userId does not match the authenticated user.', 'Cannot create an address for another user')
  @ErrorResponse(404, 'Province or ward not found.', 'Province not found')
  @ErrorResponse(409, 'The user already has a default address.', 'User already has a default address')
  create(@Req() req: AuthenticatedUser, @Body() createUserAddressDto: CreateUserAddressDto) {
    return this.userAddressService.create(req.user.userId, createUserAddressDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List addresses for the authenticated user', description: 'Returns default addresses first, followed by the most recently created addresses.' })
  @PageQuery()
  @ApiPaginatedResponse(UserAddressResponseDto, 'Paginated addresses; data is empty when no results match.')
  @AuthErrors()
  @ErrorResponse(400, 'Invalid page number.', 'page must be a positive integer')
  findAll(@Req() req: AuthenticatedUser, @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number) {
    return this.userAddressService.findAll(page, req.user.userId);
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(roleEnum.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List addresses as an administrator', description: 'Optionally filter by userId; omit it to list addresses for all users.' })
  @PageQuery()
  @ApiQuery({ name: 'userId', required: false, type: String, format: 'uuid', description: 'Filter addresses by user UUID.' })
  @ApiPaginatedResponse(UserAddressResponseDto, 'Paginated addresses.')
  @AuthErrors()
  @ErrorResponse(400, 'Invalid page number or userId.', 'Validation failed (uuid is expected)')
  @ErrorResponse(403, 'Administrator role required.', 'You do not have permission to access this resource.')
  findAllForAdmin(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('userId', new ParseUUIDPipe({ optional: true })) userId?: string,
  ) {
    return this.userAddressService.findAll(page, userId);
  }

  @Get('admin/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(roleEnum.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get any address by ID as an administrator' })
  @AddressId()
  @ApiResponse({ status: 200, description: 'Address found.', type: UserAddressResponseDto })
  @AuthErrors()
  @ErrorResponse(400, 'Invalid address UUID.', 'Validation failed (uuid is expected)')
  @ErrorResponse(403, 'Administrator role required.', 'You do not have permission to access this resource.')
  @ErrorResponse(404, 'Address not found.', 'Address not found')
  findOneForAdmin(@Param('id', ParseUUIDPipe) id: string) {
    return this.userAddressService.findOneForAdmin(id);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get an address belonging to the authenticated user' })
  @AddressId()
  @ApiResponse({ status: 200, description: 'Address found.', type: UserAddressResponseDto })
  @AuthErrors()
  @ErrorResponse(400, 'Invalid address UUID.', 'Validation failed (uuid is expected)')
  @ErrorResponse(404, 'Address not found for the authenticated user.', 'Address not found')
  findOne(@Param('id', ParseUUIDPipe) id: string, @Req() req: AuthenticatedUser) {
    return this.userAddressService.findOne(id, req.user.userId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update an address belonging to the authenticated user', description: 'Set wardId to null to clear the ward. Set isDefault to true to make this the default address.' })
  @AddressId()
  @ApiBody({ type: UpdateUserAddressDto })
  @ApiResponse({ status: 200, description: 'Address updated successfully.', type: UserAddressResponseDto })
  @AuthErrors()
  @ErrorResponse(400, 'Invalid ID or input; ward does not belong to the province.', 'Ward does not belong to province')
  @ErrorResponse(403, 'An address cannot be transferred to another user.', 'Cannot transfer an address to another user')
  @ErrorResponse(404, 'Address, province, or ward not found.', 'Address not found')
  @ErrorResponse(409, 'Conflict while updating the default address.', 'User already has a default address')
  update(@Param('id', ParseUUIDPipe) id: string, @Req() req: AuthenticatedUser, @Body() updateUserAddressDto: UpdateUserAddressDto) {
    return this.userAddressService.update(id, req.user.userId, updateUserAddressDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft-delete an address belonging to the authenticated user', description: 'Deleting a default address clears its default status. No replacement is selected automatically.' })
  @AddressId()
  @ApiResponse({ status: 204, description: 'Address deleted successfully.' })
  @AuthErrors()
  @ErrorResponse(400, 'Invalid address UUID.', 'Validation failed (uuid is expected)')
  @ErrorResponse(404, 'Address not found for the authenticated user.', 'Address not found')
  remove(@Param('id', ParseUUIDPipe) id: string, @Req() req: AuthenticatedUser) {
    return this.userAddressService.remove(id, req.user.userId);
  }
}
