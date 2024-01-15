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

  @Column({ nullable: false, type: 'varchar' })
  profissional: string;
  
  @Column({ nullable: false, type: 'varchar', unique: true })
  cpf: string;

  @Column({ nullable: false, type: 'varchar' })
  idade: string;

  @Column({ nullable: false, type: 'varchar' })
  status: string;

  @Column({ nullable: false, type: 'varchar' })
  telefone: string;
  
  @Column({ nullable: false, type: 'varchar' })
  cidade: string;

  @Column({ nullable: false, type: 'varchar' })
  email: string;

  @Column({ nullable: false, type: 'varchar' })
  conhecimento_ingles: string;

  @Column({ nullable: false, type: 'varchar' })
  ultima_empresa: string;

  @Column({ nullable: false, type: 'varchar' })
  ultimo_salario: string;

  @Column({ nullable: false, type: 'varchar' })
  target_clt: string;

  @Column({ nullable: false, type: 'varchar' })
  vaga_100_presencial_porto_real_rj: string;
  
  @Column({ nullable: false, type: 'varchar' })
  vaga_100_presencial_goiana_pe: string;

  @Column({ nullable: false, type: 'varchar' })
  vaga_100_presencial_betim_mg: string;

  @Column({ nullable: false, type: 'varchar' })
  vaga_hibrida_betim: string;
   
  @Column({ nullable: false, type: 'varchar' })
  home_office: string;


  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
