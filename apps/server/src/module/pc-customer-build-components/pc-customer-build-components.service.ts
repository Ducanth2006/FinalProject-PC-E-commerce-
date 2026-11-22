import { Injectable } from '@nestjs/common';
import { CreatePcCustomerBuildComponentDto } from './dto/create-pc-customer-build-component.dto';
import { UpdatePcCustomerBuildComponentDto } from './dto/update-pc-customer-build-component.dto';

@Injectable()
export class PcCustomerBuildComponentsService {
  create(createPcCustomerBuildComponentDto: CreatePcCustomerBuildComponentDto) {
    return 'This action adds a new pcCustomerBuildComponent';
  }

  findAll() {
    return `This action returns all pcCustomerBuildComponents`;
  }

  findOne(id: number) {
    return `This action returns a #${id} pcCustomerBuildComponent`;
  }

  update(id: number, updatePcCustomerBuildComponentDto: UpdatePcCustomerBuildComponentDto) {
    return `This action updates a #${id} pcCustomerBuildComponent`;
  }

  remove(id: number) {
    return `This action removes a #${id} pcCustomerBuildComponent`;
  }
}
