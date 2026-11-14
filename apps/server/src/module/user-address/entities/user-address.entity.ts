import { MetaDataEntity } from '@/common/entity/metaData.entity';
import { Province } from '@/module/province/entities/province.entity';
import { User } from '@/module/user/entities/user.entity';
import { Ward } from '@/module/ward/entities/ward.entity';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('user_addresses')
@Index(
  'idx_user_addresses_checkout',
  ['userId', 'isDefault', 'isActive'],
)
export class UserAddress extends MetaDataEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'bigint', nullable: true })
  provinceId: string | null;

  @ManyToOne(() => Province, { nullable: true })
  @JoinColumn({ name: 'province_id' })
  province: Province | null;

  @Column({ type: 'bigint', nullable: true })
  wardId: string | null;

  @ManyToOne(() => Ward, { nullable: true })
  @JoinColumn({ name: 'ward_id' })
  ward: Ward | null;

  @Column({ type: 'text', nullable: true })
  addressDetail: string | null;

  @Column({ type: 'boolean', default: false, nullable: false })
  isDefault: boolean;

}
