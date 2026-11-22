import { BadRequestException } from '@nestjs/common';
import { describe, expect, it } from 'vitest';
import { validateBigintId } from './validate-bigint-id';

describe('validateBigintId', () => {
  it('accepts positive PostgreSQL bigint IDs', () => {
    expect(() => validateBigintId('1')).not.toThrow();
    expect(() => validateBigintId('9223372036854775807')).not.toThrow();
  });

  it.each(['0', '-1', '1.5', 'abc', '01', '9223372036854775808', '9'.repeat(100)])('rejects %s', (id) => {
    expect(() => validateBigintId(id)).toThrow(BadRequestException);
  });
});
