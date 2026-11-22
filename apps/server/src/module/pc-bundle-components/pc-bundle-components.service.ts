import { Injectable } from '@nestjs/common';
import { CreatePcBundleComponentDto } from './dto/create-pc-bundle-component.dto';
import { UpdatePcBundleComponentDto } from './dto/update-pc-bundle-component.dto';

@Injectable()
export class PcBundleComponentsService {
  create(createPcBundleComponentDto: CreatePcBundleComponentDto) {
    return 'This action adds a new pcBundleComponent';
  }

  findAll() {
    return `This action returns all pcBundleComponents`;
  }

  findOne(id: number) {
    return `This action returns a #${id} pcBundleComponent`;
  }

  update(id: number, updatePcBundleComponentDto: UpdatePcBundleComponentDto) {
    return `This action updates a #${id} pcBundleComponent`;
  }

  remove(id: number) {
    return `This action removes a #${id} pcBundleComponent`;
  }
}
