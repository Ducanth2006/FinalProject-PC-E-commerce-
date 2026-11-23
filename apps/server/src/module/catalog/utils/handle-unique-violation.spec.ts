import { ConflictException } from '@nestjs/common';
import { describe, expect, it } from 'vitest';
import { handleUniqueViolation } from './handle-unique-violation';

describe('handleUniqueViolation', () => {
  it('maps only matching unique constraints to a conflict', () => {
    expect(() => handleUniqueViolation({ code: '23505', constraint: 'known' }, ['known'], 'trùng')).toThrow(ConflictException);
    const other = { code: '23505', constraint: 'other' };
    try { handleUniqueViolation(other, ['known'], 'trùng'); } catch (error) { expect(error).toBe(other); }
  });
});
