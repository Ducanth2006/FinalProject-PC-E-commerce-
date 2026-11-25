import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, Repository } from 'typeorm';
import { validateBigintId } from '@/common/utils/validate-bigint-id';
import { Product, ProductType } from '@/module/catalog/products/entities/product.entity';
import { PcBundleComponent } from './entities/pc-bundle-component.entity';
import { CreatePcBundleComponentDto } from './dto/create-pc-bundle-component.dto';
import { UpdatePcBundleComponentDto } from './dto/update-pc-bundle-component.dto';
import { PcBundleComponentResponseDto } from './dto/response-pc-bundle-component.dto';

@Injectable()
export class PcBundleComponentsService {
  constructor(
    @InjectRepository(PcBundleComponent) private readonly bundleComponents: Repository<PcBundleComponent>,
    @InjectRepository(Product) private readonly products: Repository<Product>,
  ) {}

  async findAll(pcId: string): Promise<PcBundleComponentResponseDto[]> {
    validateBigintId(pcId, 'PC ID');
    const pc = await this.products.findOne({
      where: { id: pcId, type: ProductType.PC_BUNDLE, isActive: true, deletedAt: IsNull() },
    });
    if (!pc) throw new NotFoundException('Active PC bundle not found');

    const rows = await this.bundleComponents.createQueryBuilder('bundleComponent')
      .innerJoinAndSelect('bundleComponent.component', 'component')
      .where('bundleComponent.pcId = :pcId', { pcId })
      .andWhere('bundleComponent.isActive = true')
      .andWhere('bundleComponent.deletedAt IS NULL')
      .andWhere('component.isActive = true')
      .andWhere('component.deletedAt IS NULL')
      .orderBy('component.name', 'ASC')
      .getMany();

    return rows.map(({ component, quantity }) => ({
      componentId: component.id,
      name: component.name,
      sku: component.sku,
      specs: component.specs,
      quantity,
      warrantyMonths: component.warrantyMonths,
    }));
  }

  async create(userId: string, dto: CreatePcBundleComponentDto): Promise<PcBundleComponentResponseDto[]> {
    validateBigintId(dto.pcId, 'PC ID');
    validateBigintId(dto.componentId, 'Component ID');

    await this.bundleComponents.manager.transaction(async (manager) => {
      const products = manager.getRepository(Product);
      const bundleComponents = manager.getRepository(PcBundleComponent);
      const pc = await products.findOne({
        where: { id: dto.pcId, type: ProductType.PC_BUNDLE, isActive: true, deletedAt: IsNull() },
        lock: { mode: 'pessimistic_write' },
      });
      if (!pc) throw new NotFoundException('Active PC bundle not found');

      const component = await products.findOne({
        where: { id: dto.componentId, type: ProductType.COMPONENT, isActive: true, display: true, deletedAt: IsNull() },
        relations: { category: true },
      });
      if (!component) throw new NotFoundException('Active component product not found');

      const existingActive = await bundleComponents.findOne({
        where: { pcId: dto.pcId, componentId: dto.componentId, isActive: true, deletedAt: IsNull() },
      });
      if (existingActive) {
        throw new ConflictException('This component is already in the PC bundle');
      }

      await bundleComponents.save(bundleComponents.create({
        pcId: dto.pcId,
        componentId: dto.componentId,
        quantity: dto.quantity,
        createdBy: userId,
        updatedBy: userId,
      }));
    });

    return this.findAll(dto.pcId);
  }

  async update(pcId: string, componentId: string, userId: string, dto: UpdatePcBundleComponentDto): Promise<PcBundleComponentResponseDto[]> {
    validateBigintId(pcId, 'PC ID');
    validateBigintId(componentId, 'Component ID');
    if (dto.quantity === undefined) {
      throw new BadRequestException('Provide quantity to update');
    }

    const pc = await this.products.findOne({
      where: { id: pcId, type: ProductType.PC_BUNDLE, isActive: true, deletedAt: IsNull() },
    });
    if (!pc) throw new NotFoundException('Active PC bundle not found');

    const row = await this.bundleComponents.findOne({
      where: { pcId, componentId, isActive: true, deletedAt: IsNull() },
    });
    if (!row) throw new NotFoundException('Component is not in this PC bundle');
    if (dto.quantity !== undefined) row.quantity = dto.quantity;
    row.updatedBy = userId;
    await this.bundleComponents.save(row);
    return this.findAll(pcId);
  }

  async remove(pcId: string, componentId: string, userId: string): Promise<void> {
    validateBigintId(pcId, 'PC ID');
    validateBigintId(componentId, 'Component ID');
    const pc = await this.products.findOne({
      where: { id: pcId, type: ProductType.PC_BUNDLE, isActive: true, deletedAt: IsNull() },
    });
    if (!pc) throw new NotFoundException('Active PC bundle not found');
    const result = await this.bundleComponents.update(
      { pcId, componentId, isActive: true, deletedAt: IsNull() },
      { isActive: false, deletedAt: new Date(), deletedBy: userId, updatedBy: userId },
    );
    if (!result.affected) throw new NotFoundException('Component is not in this PC bundle');
  }
}
