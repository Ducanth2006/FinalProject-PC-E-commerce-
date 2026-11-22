import { ForbiddenException } from '@nestjs/common';
import { IsNull, Repository } from 'typeorm';
import { User } from '@/module/user/entities/user.entity';
import { UserStatus } from '@/module/user/enums/user-status.enum';

/** Kiểm tra tài khoản chưa xóa mềm, đang hoạt động và không bị khóa. */
export async function requireActiveUser(users: Repository<User>, userId: string): Promise<User> {
  const user = await users.findOne({
    where: { id: userId, isActive: true, deletedAt: IsNull() },
  });
  if (!user || user.status === UserStatus.BLOCKED) {
    throw new ForbiddenException('Tài khoản không hoạt động, đã bị xóa hoặc bị khóa');
  }
  return user;
}
