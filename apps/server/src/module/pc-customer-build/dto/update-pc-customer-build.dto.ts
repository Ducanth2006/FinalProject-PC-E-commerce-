import { PartialType } from '@nestjs/mapped-types';
import { CreatePcCustomerBuildDto } from './create-pc-customer-build.dto';

export class UpdatePcCustomerBuildDto extends PartialType(CreatePcCustomerBuildDto) {}
