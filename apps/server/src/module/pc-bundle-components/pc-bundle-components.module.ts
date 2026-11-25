import { Module } from '@nestjs/common';
import { PcBundleComponentsService } from './pc-bundle-components.service';
import { PcBundleComponentsController } from './pc-bundle-components.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PcBundleComponent } from './entities/pc-bundle-component.entity';
import { Product } from '@/module/catalog/products/entities/product.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PcBundleComponent, Product])],
  controllers: [PcBundleComponentsController],
  providers: [PcBundleComponentsService],
})
export class PcBundleComponentsModule {}
