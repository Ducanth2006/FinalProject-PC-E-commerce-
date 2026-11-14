import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Province } from './entities/province.entity';

@Injectable()
export class ProvinceService {
  constructor(
    @InjectRepository(Province)
    private readonly provinceRepository: Repository<Province>,
  ) {}

  findAll(): Promise<Province[]> {
    return this.provinceRepository
      .createQueryBuilder('province')
      .where('province.isActive = :active', { active: true })
      .getMany();
  }

  async findOne(id: string): Promise<Province> {
    this.validateId(id);

    const province = await this.provinceRepository
      .createQueryBuilder('province')
      .where('province.id = :id', { id })
      .andWhere('province.isActive = :active', { active: true })
      .getOne();

    if (!province) {
      throw new NotFoundException(`Active province with ID ${id} was not found`);
    }

    return province;
  }

  private validateId(id: string): void {
    if (!/^\d+$/.test(id) || BigInt(id) <= 0n) {
      throw new BadRequestException('ID must be a positive integer');
    }
  }
}
