import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PcBundleComponentsService } from './pc-bundle-components.service';
import { CreatePcBundleComponentDto } from './dto/create-pc-bundle-component.dto';
import { UpdatePcBundleComponentDto } from './dto/update-pc-bundle-component.dto';

@Controller('pc-bundle-components')
export class PcBundleComponentsController {
  constructor(private readonly pcBundleComponentsService: PcBundleComponentsService) {}

  @Post()
  create(@Body() createPcBundleComponentDto: CreatePcBundleComponentDto) {
    return this.pcBundleComponentsService.create(createPcBundleComponentDto);
  }

  @Get()
  findAll() {
    return this.pcBundleComponentsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pcBundleComponentsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePcBundleComponentDto: UpdatePcBundleComponentDto) {
    return this.pcBundleComponentsService.update(+id, updatePcBundleComponentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.pcBundleComponentsService.remove(+id);
  }
}
