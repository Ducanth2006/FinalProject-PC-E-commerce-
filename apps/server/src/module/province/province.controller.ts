import { Controller, Get, Param } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { ProvinceService } from './province.service';

@ApiTags('Provinces')
@Controller('province')
export class ProvinceController {
  constructor(private readonly provinceService: ProvinceService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all active provinces',
    description: 'Returns all provinces where isActive is true.',
  })
  @ApiOkResponse({
    description: 'Active provinces were retrieved successfully.',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        example: {
          id: '1',
          code: '01',
          name: 'Ha Noi',
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
    return this.provinceService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get an active province by ID',
    description: 'Returns one active province matching the supplied ID.',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Positive integer province ID.',
    example: '1',
  })
  @ApiOkResponse({
    description: 'The active province was retrieved successfully.',
    schema: {
      example: {
        id: '1',
        code: '01',
        name: 'Ha Noi',
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
    description: 'No active province exists with the supplied ID.',
    schema: { example: { statusCode: 404, message: 'Active province with ID 1 was not found', error: 'Not Found' } },
  })
  findOne(@Param('id') id: string) {
    return this.provinceService.findOne(id);
  }
}
