import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiProperty,
} from '@nestjs/swagger';
import { PartialType } from '@nestjs/swagger';

import { RolesService } from './roles.service';
import { BaseErrorDto } from '@/common/dto/base-dtoError.dto';
import { RoleResponseDto } from './dto/role-response.dto.js';
export class RoleNotFoundDto extends PartialType(BaseErrorDto) {
  @ApiProperty({ example: 'Role không tồn tại' })
  message: string;
}
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all roles',
    description: 'Get all roles',
  })
  @ApiOkResponse({
    description: 'Get roles successfully ',
    type: [RoleResponseDto],
  })
  @ApiBadRequestResponse({
    description: "Can't find roles ",
    type: RoleNotFoundDto,
  })
  findAll() {
    return this.rolesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get role by id ' })
@ApiParam({
  name: 'id',
  type: String,
  description: 'Id',
  example: '123e4567-e89b-12d3-a456-426614174000',
})
@ApiOkResponse({
  description: "Get Role by id successfully  ",
  type: RoleResponseDto,
})
@ApiNotFoundResponse({
  description: "Can't find role by id ",
  type: RoleNotFoundDto,
})
@ApiBadRequestResponse({
  description: 'ID must be String',
  type: RoleNotFoundDto,
})
  findOne(@Param('id') id: string) {
    return this.rolesService.findOne(id);
  }
}
