import { ConflictException } from '@nestjs/common';

/** Chỉ chuyển lỗi trùng của các constraint được chỉ định; giữ nguyên lỗi khác. */
export function handleUniqueViolation(error: unknown, constraints: readonly string[], message: string): never {
  if (error && typeof error === 'object' && 'code' in error && 'constraint' in error &&
      error.code === '23505' && typeof error.constraint === 'string' && constraints.includes(error.constraint)) {
    throw new ConflictException(message);
  }
  throw error;
}
