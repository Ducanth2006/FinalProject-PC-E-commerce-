import { Module } from '@nestjs/common';
import { PcBundleComponentsService } from './pc-bundle-components.service';
import { PcBundleComponentsController } from './pc-bundle-components.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PcBundleComponent } from './entities/pc-bundle-component.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PcBundleComponent])],
  controllers: [PcBundleComponentsController],
  providers: [PcBundleComponentsService],
})
export class PcBundleComponentsModule {}
