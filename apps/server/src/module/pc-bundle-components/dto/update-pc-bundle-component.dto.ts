import { PartialType } from '@nestjs/mapped-types';
import { CreatePcBundleComponentDto } from './create-pc-bundle-component.dto';

export class UpdatePcBundleComponentDto extends PartialType(CreatePcBundleComponentDto) {}
