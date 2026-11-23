import { BadRequestException, ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { UserStatus } from '@/module/user/enums/user-status.enum';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { QueryCategoryDto } from './dto/query-category.dto';
import { CreateCategoriesDto } from './dto/create-categories.dto';

describe('CategoriesService.create', () => {
  const categories = { create: vi.fn((value) => value), save: vi.fn(), findOne: vi.fn() };
  const users = { findOne: vi.fn() };
  let service: CategoriesService;

  beforeEach(() => {
    vi.resetAllMocks();
    categories.create.mockImplementation((value) => value);
    categories.save.mockImplementation(async (value) => ({ ...value, id: '2', version: 1, secret: 'hidden' }));
    users.findOne.mockResolvedValue({ status: UserStatus.ACTIVE });
    service = new CategoriesService(categories as never, users as never);
  });

  it('creates a root category with a generated slug and creator', async () => {
    const result = await service.create('user-id', { name: ' Điện máy ' });
    expect(categories.save).toHaveBeenCalledWith({ name: 'Điện máy', slug: 'dien-may', parentId: null, createdBy: 'user-id' });
    expect(result).toMatchObject({ id: '2', version: 1, parentId: null });
    expect(result).not.toHaveProperty('secret');
  });

  it('creates a child only when its parent is active and not soft-deleted', async () => {
    categories.findOne.mockResolvedValueOnce({ id: '1' }).mockResolvedValueOnce(null);
    await service.create('user-id', { name: 'RAM', parentId: '1' });
    expect(categories.findOne).toHaveBeenCalledWith({ where: { id: '1', isActive: true } });
    await expect(service.create('user-id', { name: 'RAM', parentId: '1' })).rejects.toBeInstanceOf(NotFoundException);
  });

  it('rejects blocked users and out-of-range parent IDs', async () => {
    users.findOne.mockResolvedValueOnce({ status: UserStatus.BLOCKED });
    await expect(service.create('user-id', { name: 'RAM' })).rejects.toBeInstanceOf(ForbiddenException);
    await expect(service.create('user-id', { name: 'RAM', parentId: '9223372036854775808' })).rejects.toBeInstanceOf(BadRequestException);
  });

  it('reports duplicate slugs as conflicts', async () => {
    categories.save.mockRejectedValue({ code: '23505', constraint: 'categories_slug_active_unique' });
    await expect(service.create('user-id', { name: 'RAM' })).rejects.toBeInstanceOf(ConflictException);
  });
});

describe('CreateCategoryDto', () => {
  it('rejects blank or overlong names and malformed parent IDs', async () => {
    for (const input of [{ name: ' ' }, { name: 'a'.repeat(256) }, { name: 'RAM', parentId: '-1' }]) {
      expect((await validate(plainToInstance(CreateCategoryDto, input))).length).toBeGreaterThan(0);
    }
    expect(await validate(plainToInstance(CreateCategoryDto, { name: 'RAM', parentId: null }))).toHaveLength(0);
  });
});

describe('CategoriesService.findAll', () => {
  const query = { where: vi.fn(), andWhere: vi.fn(), innerJoin: vi.fn(), orderBy: vi.fn(), addOrderBy: vi.fn(), skip: vi.fn(), take: vi.fn(), getManyAndCount: vi.fn() };
  const categories = { createQueryBuilder: vi.fn() };
  const service = new CategoriesService(categories as never, {} as never);

  beforeEach(() => {
    vi.resetAllMocks();
    categories.createQueryBuilder.mockReturnValue(query);
    query.where.mockReturnValue(query);
    query.andWhere.mockReturnValue(query);
    query.innerJoin.mockReturnValue(query);
    query.orderBy.mockReturnValue(query);
    query.addOrderBy.mockReturnValue(query);
    query.skip.mockReturnValue(query);
    query.take.mockReturnValue(query);
    query.getManyAndCount.mockResolvedValue([[{ id: '2', name: 'RAM', slug: 'ram', secret: 'hidden' }], 1]);
  });

  it('combines slug and direct parent slug filters and exposes only DTO fields', async () => {
    const result = await service.findAll({ slug: 'ram', parentSlug: 'linh-kien' });
    expect(query.andWhere).toHaveBeenCalledWith('category.slug = :slug', { slug: 'ram' });
    expect(query.innerJoin).toHaveBeenCalledWith('category.parent', 'parent', 'parent.isActive = :parentActive', { parentActive: true });
    expect(query.andWhere).toHaveBeenCalledWith('parent.slug = :parentSlug', { parentSlug: 'linh-kien' });
    expect(result.data[0]).toMatchObject({ id: '2', name: 'RAM' });
    expect(result.data[0]).not.toHaveProperty('secret');
  });

  it('returns an empty array with no filters', async () => {
    query.getManyAndCount.mockResolvedValue([[], 0]);
    expect(await service.findAll()).toEqual({ data: [], total: 0, page: 1, totalPages: 0 });
    expect(query.innerJoin).not.toHaveBeenCalled();
  });

  it('validates query strings', async () => {
    expect(await validate(plainToInstance(QueryCategoryDto, { parentSlug: 'linh-kien' }))).toHaveLength(0);
    expect((await validate(plainToInstance(QueryCategoryDto, { slug: ' ' }))).length).toBeGreaterThan(0);
  });

  it('searches by part of the name without treating SQL wildcards as wildcards', async () => {
    await service.findAll({ name: '  100%_\\  ', parentSlug: 'linh-kien' });
    expect(query.andWhere).toHaveBeenCalledWith("category.name ILIKE :name ESCAPE '\\'", { name: '%100\\%\\_\\\\%' });
    expect(query.innerJoin).toHaveBeenCalled();
  });

  it('ignores a blank name search', async () => {
    await service.findAll({ name: ' ' });
    expect(query.andWhere).not.toHaveBeenCalled();
  });

  it('returns the requested page and rejects invalid page values', async () => {
    query.getManyAndCount.mockResolvedValue([[], 21]);
    expect(await service.findAll({ page: '2', pageSize: '5', name: 'ram' })).toEqual({ data: [], total: 21, page: 2, totalPages: 5 });
    expect(query.skip).toHaveBeenCalledWith(5);
    expect(query.take).toHaveBeenCalledWith(5);
    await expect(service.findAll({ page: '0' })).rejects.toBeInstanceOf(BadRequestException);
    await expect(service.findAll({ page: '9999999999' })).rejects.toBeInstanceOf(BadRequestException);
    await expect(service.findAll({ pageSize: '0' })).rejects.toBeInstanceOf(BadRequestException);
    await expect(service.findAll({ pageSize: '1.5' })).rejects.toBeInstanceOf(BadRequestException);
    await expect(service.findAll({ pageSize: '2147483648' })).rejects.toBeInstanceOf(BadRequestException);
  });
});

describe('CategoriesService.findOne', () => {
  const categories = { findOne: vi.fn() };
  const service = new CategoriesService(categories as never, {} as never);

  beforeEach(() => vi.resetAllMocks());

  it('returns the active category as a response DTO', async () => {
    categories.findOne.mockResolvedValue({ id: '1', name: 'RAM', version: 1, secret: 'hidden' });
    const result = await service.findOne('1');
    expect(categories.findOne).toHaveBeenCalledWith({ where: { id: '1', isActive: true } });
    expect(result).toMatchObject({ id: '1', name: 'RAM', version: 1 });
    expect(result).not.toHaveProperty('secret');
  });

  it('rejects invalid IDs and missing or inactive categories', async () => {
    await expect(service.findOne('invalid')).rejects.toBeInstanceOf(BadRequestException);
    categories.findOne.mockResolvedValue(null);
    await expect(service.findOne('1')).rejects.toBeInstanceOf(NotFoundException);
  });
});

describe('CategoriesService.createBulk', () => {
  const repository = { create: vi.fn((value) => value), save: vi.fn(), find: vi.fn() };
  const categories = { manager: { transaction: vi.fn() } };
  const users = { findOne: vi.fn() };
  let service: CategoriesService;

  beforeEach(() => {
    vi.resetAllMocks();
    repository.create.mockImplementation((value) => value);
    repository.save.mockImplementation(async (values) => values.map((value, i) => ({ ...value, id: String(i + 2), version: 1, secret: 'hidden' })));
    repository.find.mockResolvedValue([{ id: '1' }]);
    categories.manager.transaction.mockImplementation(async (fn) => fn({ getRepository: () => repository }));
    users.findOne.mockResolvedValue({ status: UserStatus.ACTIVE });
    service = new CategoriesService(categories as never, users as never);
  });

  it('validates parents and saves the complete batch in a transaction', async () => {
    const result = await service.createBulk('user-id', { categories: [{ name: ' Màn hình ' }, { name: 'RAM', parentId: '1' }] });
    expect(repository.find).toHaveBeenCalledOnce();
    expect(repository.save).toHaveBeenCalledWith([
      { name: 'Màn hình', slug: 'man-hinh', parentId: null, createdBy: 'user-id' },
      { name: 'RAM', slug: 'ram', parentId: '1', createdBy: 'user-id' },
    ]);
    expect(result).toHaveLength(2);
    expect(result[0]).not.toHaveProperty('secret');
  });

  it('rejects duplicate normalized names or slugs before writing', async () => {
    await expect(service.createBulk('user-id', { categories: [{ name: ' RAM ' }, { name: 'ram' }] })).rejects.toBeInstanceOf(ConflictException);
    await expect(service.createBulk('user-id', { categories: [{ name: 'Màn hình' }, { name: 'Man hinh' }] })).rejects.toBeInstanceOf(ConflictException);
    expect(categories.manager.transaction).not.toHaveBeenCalled();
  });

  it('rejects blocked users, missing parents and database conflicts', async () => {
    users.findOne.mockResolvedValueOnce({ status: UserStatus.BLOCKED });
    await expect(service.createBulk('user-id', { categories: [{ name: 'RAM' }] })).rejects.toBeInstanceOf(ForbiddenException);
    repository.find.mockResolvedValueOnce([]);
    await expect(service.createBulk('user-id', { categories: [{ name: 'RAM', parentId: '1' }] })).rejects.toBeInstanceOf(NotFoundException);
    expect(repository.save).not.toHaveBeenCalled();
    repository.save.mockRejectedValueOnce({ code: '23505', constraint: 'categories_slug_active_unique' });
    await expect(service.createBulk('user-id', { categories: [{ name: 'RAM' }] })).rejects.toBeInstanceOf(ConflictException);
  });

  it('validates the batch and nested DTOs', async () => {
    for (const categories of [[], [null], [{ name: ' ' }], Array.from({ length: 101 }, () => ({ name: 'A' }))]) {
      expect((await validate(plainToInstance(CreateCategoriesDto, { categories }))).length).toBeGreaterThan(0);
    }
    expect(await validate(plainToInstance(CreateCategoriesDto, { categories: [{ name: 'RAM' }] }))).toHaveLength(0);
  });
});

describe('CategoriesService.update', () => {
  const query = { where: vi.fn(), andWhere: vi.fn(), getOne: vi.fn(), update: vi.fn(), set: vi.fn(), execute: vi.fn() };
  const repository = { createQueryBuilder: vi.fn(), findOne: vi.fn(), findOneByOrFail: vi.fn() };
  const manager = { getRepository: vi.fn(), query: vi.fn() };
  const categories = { manager: { transaction: vi.fn() } };
  const users = { findOne: vi.fn() };
  let service: CategoriesService;
  beforeEach(() => {
    vi.resetAllMocks();
    for (const fn of [query.where, query.andWhere, query.update, query.set]) fn.mockReturnValue(query);
    query.getOne.mockResolvedValue(null);
    query.execute.mockResolvedValue({ affected: 1 });
    repository.createQueryBuilder.mockReturnValue(query);
    repository.findOne.mockResolvedValue({ id: '1', isActive: true });
    repository.findOneByOrFail.mockResolvedValue({ id: '2', name: 'RAM mới', slug: 'ram-moi', version: 2 });
    manager.getRepository.mockReturnValue(repository);
    manager.query.mockResolvedValue([]);
    categories.manager.transaction.mockImplementation(async (fn) => fn(manager));
    users.findOne.mockResolvedValue({ status: UserStatus.ACTIVE });
    service = new CategoriesService(categories as never, users as never);
  });

  it('updates slug and parent using an atomic version check', async () => {
    const result = await service.update('2', 'user-id', { name: ' RAM mới ', parentId: '1', version: 1 });
    expect(query.set).toHaveBeenCalledWith(expect.objectContaining({ name: 'RAM mới', slug: 'ram-moi', parentId: '1', updatedBy: 'user-id' }));
    expect(query.where).toHaveBeenCalledWith('id = :id AND version = :version AND is_active = true AND deleted_at IS NULL', { id: '2', version: 1 });
    expect(result.version).toBe(2);
  });

  it('rejects duplicate names, cycles and stale versions', async () => {
    query.getOne.mockResolvedValueOnce({ id: '3' });
    await expect(service.update('2', 'user-id', { name: 'RAM', version: 1 })).rejects.toBeInstanceOf(ConflictException);
    manager.query.mockResolvedValueOnce([]).mockResolvedValueOnce([{ id: '2' }]);
    await expect(service.update('2', 'user-id', { parentId: '1', version: 1 })).rejects.toBeInstanceOf(BadRequestException);
    query.execute.mockResolvedValueOnce({ affected: 0 });
    await expect(service.update('2', 'user-id', { name: 'RAM', version: 1 })).rejects.toBeInstanceOf(ConflictException);
  });

  it('rejects missing parents and blocked users', async () => {
    repository.findOne.mockResolvedValueOnce(null);
    await expect(service.update('2', 'user-id', { parentId: '1', version: 1 })).rejects.toBeInstanceOf(NotFoundException);
    users.findOne.mockResolvedValueOnce({ status: UserStatus.BLOCKED });
    await expect(service.update('2', 'user-id', { name: 'RAM', version: 1 })).rejects.toBeInstanceOf(ForbiddenException);
  });
});

describe('CategoriesService.remove', () => {
  const categories = { update: vi.fn() };
  const users = { findOne: vi.fn() };
  const service = new CategoriesService(categories as never, users as never);

  beforeEach(() => {
    vi.resetAllMocks();
    users.findOne.mockResolvedValue({ status: UserStatus.ACTIVE });
    categories.update.mockResolvedValue({ affected: 1 });
  });

  it('soft-deletes a category and records the actor', async () => {
    await expect(service.remove('1', 'user-id')).resolves.toBeUndefined();
    expect(categories.update).toHaveBeenCalledWith(
      { id: '1', deletedAt: expect.objectContaining({ _type: 'isNull' }) },
      { deletedAt: expect.any(Function), deletedBy: 'user-id' },
    );
  });

  it('rejects invalid IDs, blocked users and missing or deleted categories', async () => {
    await expect(service.remove('abc', 'user-id')).rejects.toBeInstanceOf(BadRequestException);
    users.findOne.mockResolvedValueOnce({ status: UserStatus.BLOCKED });
    await expect(service.remove('1', 'user-id')).rejects.toBeInstanceOf(ForbiddenException);
    categories.update.mockResolvedValueOnce({ affected: 0 });
    await expect(service.remove('1', 'user-id')).rejects.toBeInstanceOf(NotFoundException);
  });
});
