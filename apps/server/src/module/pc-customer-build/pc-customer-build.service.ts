import { Injectable } from '@nestjs/common';
import { CreatePcCustomerBuildDto } from './dto/create-pc-customer-build.dto';
import { UpdatePcCustomerBuildDto } from './dto/update-pc-customer-build.dto';

@Injectable()
export class PcCustomerBuildService {
  create(createPcCustomerBuildDto: CreatePcCustomerBuildDto) {
    return 'This action adds a new pcCustomerBuild';
  }

  findAll() {
    return `This action returns all pcCustomerBuild`;
  }

  findOne(id: number) {
    return `This action returns a #${id} pcCustomerBuild`;
  }

  update(id: number, updatePcCustomerBuildDto: UpdatePcCustomerBuildDto) {
    return `This action updates a #${id} pcCustomerBuild`;
  }

  remove(id: number) {
    return `This action removes a #${id} pcCustomerBuild`;
  }
}
