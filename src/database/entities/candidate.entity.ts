import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('candidates')
export class Candidate {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true, type: 'varchar' })
  profissional: string;
  
  @Column({ nullable: false, type: 'varchar', unique: true })
  cpf: string;

  @Column({ nullable: true, type: 'varchar' })
  idade: string;

  @Column({ nullable: true, type: 'varchar' })
  status: string;

  @Column({ nullable: true, type: 'varchar' })
  telefone: string;
  
  @Column({ nullable: true, type: 'varchar' })
  cidade: string;

  @Column({ nullable: true, type: 'varchar' })
  email: string;

  @Column({ nullable: true, type: 'varchar' })
  conhecimento_ingles: string;

  @Column({ nullable: true, type: 'varchar' })
  ultima_empresa: string;

  @Column({ nullable: true, type: 'varchar' })
  ultimo_salario: string;

  @Column({ nullable: true, type: 'varchar' })
  target_clt: string;

  @Column({ nullable: true, type: 'varchar' })
  vaga_100_presencial_porto_real_rj: string;
  
  @Column({ nullable: true, type: 'varchar' })
  vaga_100_presencial_goiana_pe: string;

  @Column({ nullable: true, type: 'varchar' })
  vaga_100_presencial_betim_mg: string;

  @Column({ nullable: true, type: 'varchar' })
  vaga_hibrida_betim: string;
   
  @Column({ nullable: true, type: 'varchar' })
  home_office: string;


  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
