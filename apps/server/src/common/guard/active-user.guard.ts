import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '@/module/user/entities/user.entity';
import { requireActiveUser } from '@/common/utils/require-active-user';

@Injectable()
export class ActiveUserGuard implements CanActivate {
  constructor(@InjectRepository(User) private readonly users: Repository<User>) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<{ user?: { userId?: string } }>();
    if (!request.user?.userId) throw new UnauthorizedException('Authentication is required');
    await requireActiveUser(this.users, request.user.userId);
    return true;
  }
}
