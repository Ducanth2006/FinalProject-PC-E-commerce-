import { Module } from '@nestjs/common';
import { BrandsService } from './brands.service';
import { BrandsController } from './brands.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Brand } from './entities/brand.entity';
import { User } from '@/module/user/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Brand, User])],
  controllers: [BrandsController],
  providers: [BrandsService],
})
export class BrandsModule {}
