import { ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { UserStatus } from '@/module/user/enums/user-status.enum';
import { ActiveUserGuard } from './active-user.guard';

describe('ActiveUserGuard', () => {
  const context = (user?: { userId: string }) => ({ switchToHttp: () => ({ getRequest: () => ({ user }) }) }) as ExecutionContext;

  it('allows an active authenticated user', async () => {
    const users = { findOne: vi.fn().mockResolvedValue({ status: UserStatus.ACTIVE }) };
    await expect(new ActiveUserGuard(users as never).canActivate(context({ userId: 'id' }))).resolves.toBe(true);
    expect(users.findOne).toHaveBeenCalledWith({ where: { id: 'id', isActive: true, deletedAt: expect.objectContaining({ _type: 'isNull' }) } });
  });

  it('rejects missing authentication, unavailable users and blocked users', async () => {
    const users = { findOne: vi.fn().mockResolvedValueOnce(null).mockResolvedValueOnce({ status: UserStatus.BLOCKED }) };
    const guard = new ActiveUserGuard(users as never);
    await expect(guard.canActivate(context())).rejects.toBeInstanceOf(UnauthorizedException);
    await expect(guard.canActivate(context({ userId: 'id' }))).rejects.toBeInstanceOf(ForbiddenException);
    await expect(guard.canActivate(context({ userId: 'id' }))).rejects.toBeInstanceOf(ForbiddenException);
  });
});
