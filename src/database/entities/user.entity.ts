import { InternalServerErrorException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { RoleEnum } from '../../enums/role.enum';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false, type: 'varchar', length: 64 })
  name: string;

  @Column({
    nullable: false,
    type: 'varchar',
    unique: true,
    select: false,
    length: 64,
  })
  registration: string;

  @Column({ nullable: false, type: 'varchar', unique: true, length: 64 })
  email: string;

  @Column({ nullable: false, type: 'varchar'})
  password: string;

  @Column({ type: 'enum', nullable: false, enum: RoleEnum })
  role: RoleEnum;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @BeforeInsert()
  @BeforeUpdate()
  async passwordHash() {
    if (!this.password || this.password.trim() === '') {
      return;
    }
    try {
      this.password = await bcrypt.hash(this.password, 10);
    } catch (error) {
      throw new InternalServerErrorException('Password has error');
    }
  }
}
