import { BadRequestException } from '@nestjs/common';

export function parsePagination(pageInput?: string, pageSizeInput?: string) {
  const page = pageInput === undefined ? 1 : Number(pageInput);
  const pageSize = pageSizeInput === undefined ? 10 : Number(pageSizeInput);
  if ((pageSizeInput !== undefined && !/^[1-9]\d*$/.test(pageSizeInput)) ||
      !Number.isSafeInteger(pageSize) || pageSize < 1 || pageSize > 2147483647) {
    throw new BadRequestException('Page size is invalid');
  }
  if ((pageInput !== undefined && !/^[1-9]\d*$/.test(pageInput)) ||
      !Number.isSafeInteger(page) || page < 1 || (page - 1) * pageSize > 2147483647) {
    throw new BadRequestException('Page is invalid');
  }
  return { page, pageSize, skip: (page - 1) * pageSize };
}
