import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PcCustomerBuildComponentsService } from './pc-customer-build-components.service';
import { CreatePcCustomerBuildComponentDto } from './dto/create-pc-customer-build-component.dto';
import { UpdatePcCustomerBuildComponentDto } from './dto/update-pc-customer-build-component.dto';

@Controller('pc-customer-build-components')
export class PcCustomerBuildComponentsController {
  constructor(private readonly pcCustomerBuildComponentsService: PcCustomerBuildComponentsService) {}

  @Post()
  create(@Body() createPcCustomerBuildComponentDto: CreatePcCustomerBuildComponentDto) {
    return this.pcCustomerBuildComponentsService.create(createPcCustomerBuildComponentDto);
  }

  @Get()
  findAll() {
    return this.pcCustomerBuildComponentsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pcCustomerBuildComponentsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePcCustomerBuildComponentDto: UpdatePcCustomerBuildComponentDto) {
    return this.pcCustomerBuildComponentsService.update(+id, updatePcCustomerBuildComponentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.pcCustomerBuildComponentsService.remove(+id);
  }
}
