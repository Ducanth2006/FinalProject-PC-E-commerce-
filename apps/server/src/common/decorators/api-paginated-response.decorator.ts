import { applyDecorators, Type } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, getSchemaPath } from '@nestjs/swagger';

export function ApiPaginatedResponse(model: Type<unknown>, description = 'Danh sách phân trang') {
  return applyDecorators(
    ApiExtraModels(model),
    ApiOkResponse({
      description,
      schema: {
        type: 'object',
        required: ['data', 'total', 'page', 'totalPages'],
        properties: {
          data: { type: 'array', items: { $ref: getSchemaPath(model) } },
          total: { type: 'integer', example: 25 },
          page: { type: 'integer', example: 1 },
          totalPages: { type: 'integer', example: 3 },
        },
      },
    }),
  );
}
