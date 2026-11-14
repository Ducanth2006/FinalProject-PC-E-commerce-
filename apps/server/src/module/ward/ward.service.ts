import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ward } from './entities/ward.entity';

@Injectable()
export class WardService {
  constructor(
    @InjectRepository(Ward)
    private readonly wardRepository: Repository<Ward>,
  ) {}

  findAll(): Promise<Ward[]> {
    return this.wardRepository
      .createQueryBuilder('ward')
      .where('ward.isActive = :active', { active: true })
      .getMany();
  }

  async findOne(id: string): Promise<Ward> {
    this.validateId(id);

    const ward = await this.wardRepository
      .createQueryBuilder('ward')
      .where('ward.id = :id', { id })
      .andWhere('ward.isActive = :active', { active: true })
      .getOne();

    if (!ward) {
      throw new NotFoundException(`Active ward with ID ${id} was not found`);
    }

    return ward;
  }

  private validateId(id: string): void {
    if (!/^\d+$/.test(id) || BigInt(id) <= 0n) {
      throw new BadRequestException('ID must be a positive integer');
    }
  }
}
