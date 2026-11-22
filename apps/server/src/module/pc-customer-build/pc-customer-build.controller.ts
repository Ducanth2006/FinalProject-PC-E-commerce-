import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PcCustomerBuildService } from './pc-customer-build.service';
import { CreatePcCustomerBuildDto } from './dto/create-pc-customer-build.dto';
import { UpdatePcCustomerBuildDto } from './dto/update-pc-customer-build.dto';

@Controller('pc-customer-build')
export class PcCustomerBuildController {
  constructor(private readonly pcCustomerBuildService: PcCustomerBuildService) {}

  @Post()
  create(@Body() createPcCustomerBuildDto: CreatePcCustomerBuildDto) {
    return this.pcCustomerBuildService.create(createPcCustomerBuildDto);
  }

  @Get()
  findAll() {
    return this.pcCustomerBuildService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pcCustomerBuildService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePcCustomerBuildDto: UpdatePcCustomerBuildDto) {
    return this.pcCustomerBuildService.update(+id, updatePcCustomerBuildDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.pcCustomerBuildService.remove(+id);
  }
}
