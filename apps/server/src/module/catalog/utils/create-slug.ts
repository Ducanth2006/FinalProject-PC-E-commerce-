import { BadRequestException } from '@nestjs/common';

export function createSlug(name: string): string {
  const slug = name.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd').toLowerCase().replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  if (!slug || slug.length > 255) {
    throw new BadRequestException('Name cannot produce a valid slug of at most 255 characters');
  }
  return slug;
}
