import { Controller, Get, Param } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { WardService } from './ward.service';

@ApiTags('Wards')
@Controller('ward')
export class WardController {
  constructor(private readonly wardService: WardService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all active wards',
    description: 'Returns all wards where isActive is true.',
  })
  @ApiOkResponse({
    description: 'Active wards were retrieved successfully.',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        example: {
          id: '1',
          code: '00001',
          provinceId: '1',
          name: 'Phuc Xa',
          type: 'WARD',
          createdAt: '2026-01-15',
          createdBy: null,
          modifiedAt: null,
          modifiedBy: null,
          deletedAt: null,
          deletedBy: null,
          isActive: true,
        },
      },
    },
  })
  findAll() {
    return this.wardService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get an active ward by ID',
    description: 'Returns one active ward matching the supplied ID.',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Positive integer ward ID.',
    example: '1',
  })
  @ApiOkResponse({
    description: 'The active ward was retrieved successfully.',
    schema: {
      example: {
        id: '1',
        code: '00001',
        provinceId: '1',
        name: 'Phuc Xa',
        type: 'WARD',
        createdAt: '2026-01-15',
        createdBy: null,
        modifiedAt: null,
        modifiedBy: null,
        deletedAt: null,
        deletedBy: null,
        isActive: true,
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'The ID must be a positive integer.',
    schema: { example: { statusCode: 400, message: 'ID must be a positive integer', error: 'Bad Request' } },
  })
  @ApiNotFoundResponse({
    description: 'No active ward exists with the supplied ID.',
    schema: { example: { statusCode: 404, message: 'Active ward with ID 1 was not found', error: 'Not Found' } },
  })
  findOne(@Param('id') id: string) {
    return this.wardService.findOne(id);
  }
}
