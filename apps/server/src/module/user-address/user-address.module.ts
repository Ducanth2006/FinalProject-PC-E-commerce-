import { Module } from '@nestjs/common';
import { UserAddressService } from './user-address.service';
import { UserAddressController } from './user-address.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserAddress } from './entities/user-address.entity';
import { Province } from '../province/entities/province.entity';
import { Ward } from '../ward/entities/ward.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserAddress, Province, Ward])],
  controllers: [UserAddressController],
  providers: [UserAddressService],
})
export class UserAddressModule {}
