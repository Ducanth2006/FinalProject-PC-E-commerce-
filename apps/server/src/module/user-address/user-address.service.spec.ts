import { BadRequestException, ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { UserAddressService } from './user-address.service';
import { UserAddressResponseDto } from './dto/response-user-address.dto';

describe('soft-delete address', () => {
  it('deletes only an owned, undeleted address and clears its default status', async () => {
    const repo = { update: vi.fn().mockResolvedValue({ affected: 1 }) };
    const users = { findOne: vi.fn().mockResolvedValue({ id: 'user' }) };
    const manager = { getRepository: vi.fn((entity) => entity.name === 'User' ? users : repo) };
    const service = new UserAddressService({ manager: { transaction: (fn: (tx: typeof manager) => Promise<unknown>) => fn(manager) } } as any, {} as any, {} as any);
    await expect(service.remove('address', 'user')).resolves.toBeUndefined();
    expect(users.findOne).toHaveBeenCalledWith({ where: { id: 'user' }, lock: { mode: 'pessimistic_write' } });
    expect(users.findOne.mock.invocationCallOrder[0]).toBeLessThan(repo.update.mock.invocationCallOrder[0]);
    const [where, changes] = repo.update.mock.calls[0];
    expect(where).toMatchObject({ id: 'address', userId: 'user', isActive: true });
    expect(where.deletedAt.type).toBe('isNull');
    expect(changes).toMatchObject({ deletedBy: 'user', isActive: false, isDefault: false });
    expect(changes.deletedAt()).toBe('CURRENT_TIMESTAMP');
  });
  it('returns 404 for missing, deleted, or other users addresses', async () => {
    const repo = { update: vi.fn().mockResolvedValue({ affected: 0 }) };
    const users = { findOne: vi.fn().mockResolvedValue({ id: 'other' }) };
    const manager = { getRepository: vi.fn((entity) => entity.name === 'User' ? users : repo) };
    const service = new UserAddressService({ manager: { transaction: (fn: (tx: typeof manager) => Promise<unknown>) => fn(manager) } } as any, {} as any, {} as any);
    await expect(service.remove('address', 'other')).rejects.toBeInstanceOf(NotFoundException);
  });
});

describe('paginated addresses', () => {
  it('filters by user and orders and paginates results', async () => {
    const repo = { findAndCount: vi.fn().mockResolvedValue([[{ id: 'a', userId: 'u', secret: 'hidden' }], 11]) };
    const service = new UserAddressService(repo as any, {} as any, {} as any);
    const result = await service.findAll(2, 'u');
    expect(repo.findAndCount).toHaveBeenCalledWith({ where: { userId: 'u', isActive: true }, relations: { province: true, ward: true }, order: { isDefault: 'DESC', createdAt: 'DESC', id: 'DESC' }, skip: 5, take: 5 });
    expect(result).toMatchObject({ total: 11, page: 2, totalPages: 3 });
    expect(result.data[0]).toBeInstanceOf(UserAddressResponseDto);
    expect(result.data[0]).not.toHaveProperty('secret');
  });
  it('supports admin unfiltered results and rejects invalid pages', async () => {
    const repo = { findAndCount: vi.fn().mockResolvedValue([[], 0]) };
    const service = new UserAddressService(repo as any, {} as any, {} as any);
    expect(await service.findAll(1)).toEqual({ data: [], total: 0, page: 1, totalPages: 0 });
    expect(repo.findAndCount.mock.calls[0][0].where).toEqual({ isActive: true });
    await expect(service.findAll(0)).rejects.toBeInstanceOf(BadRequestException);
  });
});

describe('find address by id', () => {
  it('filters by owner and returns a response DTO', async () => {
    const repo = { findOne: vi.fn().mockResolvedValueOnce({ id: 'a', userId: 'u', province: { id: '1' }, ward: null, secret: 'hidden' }).mockResolvedValueOnce(null) };
    const service = new UserAddressService(repo as any, {} as any, {} as any);
    const result = await service.findOne('a', 'u');
    expect(repo.findOne).toHaveBeenCalledWith({ where: { id: 'a', userId: 'u', isActive: true }, relations: { province: true, ward: true } });
    expect(result).toBeInstanceOf(UserAddressResponseDto);
    expect(result).not.toHaveProperty('secret');
    await expect(service.findOne('a', 'other')).rejects.toBeInstanceOf(NotFoundException);
  });
  it('looks up any owner for admin and returns 404 when missing', async () => {
    const repo = { findOne: vi.fn().mockResolvedValueOnce({ id: 'a', userId: 'other' }).mockResolvedValueOnce(null) };
    const service = new UserAddressService(repo as any, {} as any, {} as any);
    expect(await service.findOneForAdmin('a')).toBeInstanceOf(UserAddressResponseDto);
    expect(repo.findOne).toHaveBeenCalledWith({ where: { id: 'a', isActive: true }, relations: { province: true, ward: true } });
    await expect(service.findOneForAdmin('missing')).rejects.toBeInstanceOf(NotFoundException);
  });
});

describe('UserAddressService.create', () => {
  const setup = () => {
    const addresses = { create: vi.fn((data) => data), save: vi.fn(async (data) => ({ id: 'address', ...data, secret: 'hidden' })) };
    const provinces = { findOneBy: vi.fn(async () => ({ id: '1', name: 'Province' })) };
    const wards = { findOneBy: vi.fn(async () => ({ id: '2', provinceId: '1', name: 'Ward' })) };
    return { service: new UserAddressService(addresses as any, provinces as any, wards as any), addresses, provinces, wards };
  };
  const dto = { userId: 'user', provinceId: '1' };

  it('rejects a different user and a missing province', async () => {
    const { service } = setup();
    await expect(service.create('other', dto)).rejects.toBeInstanceOf(ForbiddenException);
    await expect(service.create('user', { ...dto, provinceId: null as any })).rejects.toBeInstanceOf(BadRequestException);
  });

  it('checks that province and optional ward exist and belong together', async () => {
    const { service, provinces, wards } = setup();
    provinces.findOneBy.mockResolvedValueOnce(null as any);
    await expect(service.create('user', dto)).rejects.toBeInstanceOf(NotFoundException);
    wards.findOneBy.mockResolvedValueOnce(null as any);
    await expect(service.create('user', { ...dto, wardId: '2' })).rejects.toBeInstanceOf(NotFoundException);
    wards.findOneBy.mockResolvedValueOnce({ id: '2', provinceId: '3', name: 'Ward' });
    await expect(service.create('user', { ...dto, wardId: '2' })).rejects.toBeInstanceOf(BadRequestException);
  });

  it('returns an exposed DTO with optional ward and defaults', async () => {
    const { service, wards } = setup();
    const result = await service.create('user', dto);
    expect(result).toBeInstanceOf(UserAddressResponseDto);
    expect(result).toMatchObject({ userId: 'user', province: { id: '1' }, ward: null, isDefault: false, createdBy: 'user' });
    expect(result).not.toHaveProperty('secret');
    expect(wards.findOneBy).not.toHaveBeenCalled();
    expect((await service.create('user', { ...dto, wardId: '2' })).ward?.id).toBe('2');
  });

  it('maps the default-address unique violation to conflict', async () => {
    const { service, addresses } = setup();
    addresses.save.mockRejectedValueOnce({ code: '23505', constraint: 'uq_user_addresses_one_default' });
    await expect(service.create('user', { ...dto, isDefault: true })).rejects.toBeInstanceOf(ConflictException);
  });
});

