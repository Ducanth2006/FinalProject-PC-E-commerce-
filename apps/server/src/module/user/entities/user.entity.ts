import { Role } from "@/module/roles/entities/role.entity";
import { roleEnum } from "@/module/roles/enums/roles.enum";
import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  VersionColumn,
} from "typeorm";
import { JoinColumn } from "typeorm";
import { UserGender } from "../enums/gender.enum";
import { UserStatus } from "../enums/user-status.enum";
import { MetaDataEntity } from "@/common/entity/metaData.entity";
@Entity("user")
export class User extends MetaDataEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;
  @Column({ type: "varchar", length: 50, default: "CLIENT" })
  roleId: string;
  @ManyToOne(() => Role, { onDelete: "RESTRICT" })
  @JoinColumn()
  role: Role;
  @Column({ type: "varchar", length: 255, unique: true, nullable: true })
  email: string | null;
  @Column({ type: "varchar", length: 20, unique: true, nullable: true })
  phoneNumber: string | null;
  @Column({ type: "varchar", length: 255, nullable: true, select: false })
  passwordHash: string | null;
  @Column({ type: "varchar", length: 255, nullable: true, select: false })
  refreshTokenHash: string | null;
  @Column({ type: "varchar", length: 255, unique: true, nullable: true })
  googleId: string | null;
  @Column({ type: "varchar", length: 100 })
  fullName: string;
  @Column({ type: "text", nullable: true })
  avatarUrl: string | null;
  @Column({ type: "varchar", enum: UserGender, length: 10, nullable: true })
  gender: UserGender | null;
  @Column({ type: "date", nullable: true })
  dateOfBirth: Date | null;
  @Column({
    type: "varchar",
    length: 20,
    enum: UserStatus,
    default: UserStatus.PENDING,
  })
  status: UserStatus;
  @Column({ type: "timestamptz", nullable: true })
  lastLoginAt: Date | null;
  @VersionColumn({ default: 1 })
  version: number;
}
// google_id VARCHAR(255) UNIQUE,

// full_name VARCHAR(100) NOT NULL,

// avatar_url TEXT,

// gender VARCHAR(10),

// date_of_birth DATE,

// status VARCHAR(20) NOT NULL DEFAULT 'PENDING',

// last_login_at TIMESTAMP WITH TIME ZONE,
