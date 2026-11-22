import { PartialType } from '@nestjs/mapped-types';
import { CreatePcCustomerBuildComponentDto } from './create-pc-customer-build-component.dto';

export class UpdatePcCustomerBuildComponentDto extends PartialType(CreatePcCustomerBuildComponentDto) {}
