import { BadRequestException } from '@nestjs/common';

/** Kiểm tra ID nguyên dương trong phạm vi bigint của PostgreSQL. */
export function validateBigintId(id: string, label = 'ID'): void {
  if (!/^[1-9]\d*$/.test(id) || id.length > 19 || BigInt(id) > 9223372036854775807n) {
    throw new BadRequestException(`${label} không hợp lệ`);
  }
}
