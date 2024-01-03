import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, BeforeInsert, BeforeUpdate } from 'typeorm';

@Entity('candidates')
export class Candidate {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', nullable: false, unique: true, select: false })
  cpf: string;

  @Column({ nullable: false, type: 'varchar' })
  nome: string;

  @Column({ nullable: false, type: 'varchar' })
  habilidades: string;

  @Column({ nullable: false, type: 'varchar' })
  idade: number;

  @Column({ nullable: false, type: 'varchar' })
  cidade: string;

  @Column({ nullable: false, type: 'varchar' })
  estado: string;

  @Column({ type: 'boolean', nullable: false, default: false})
  avaliado: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updateAt: Date;


}
