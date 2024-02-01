import { File } from '../../database/entities/file.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';

@Entity('candidates')
export class Candidate {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false, type: 'varchar' })
  profissional: string;

  @Column({ nullable: true, type: 'varchar' })
  codigoCandidate: string;

  @Column({ nullable: false, type: 'date' })
  data_de_nascimento: string;

  @Column({ nullable: true, type: 'int' })
  idade: number;

  @Column({ nullable: false, type: 'varchar', unique: true })
  cpf: string;

  @Column({ nullable: false, type: 'varchar' })
  cidade: string;

  @Column({ nullable: false, type: 'varchar' })
  uf: string;

  @Column({ nullable: false, type: 'varchar' })
  telefone: string;

  @Column({ nullable: false, type: 'varchar' })
  email: string;

  //  Page  


  @Column({ nullable: false, type: 'varchar' })
  esta_empregado: string;

  @Column({nullable: true, type: 'varchar'})
  empresa_atual: string;

  @Column({nullable: false, type: 'varchar'})
  experiencia_ramo_automotivo: string;

  @Column({nullable: false, type: 'varchar'})
  modalidade_atual: string;

  @Column({nullable: false, type: 'varchar'})
  tipo_desejado_linkedin: string;

  @Column({nullable: false, type: 'varchar'})
  nivel_funcao: string;

  @Column({nullable: false, type: 'varchar'})
  formacao: string;

  @Column({nullable: false, type: 'varchar'})
  interesse_imediato: string;

  //  --

  @Column({nullable: false, type: 'varchar'})
  entrevista_online: string;

  @Column({nullable: false, type: 'varchar'})
  teste_tecnico: string;

  @Column({ nullable: false, type: 'varchar' })
  conhecimento_ingles: string;

  @Column({ nullable: false,  })
  pretensao_salarial: number;

  @Column({ nullable: false, })
  pretensao_pj: number;

  @Column({ nullable: false, type: 'varchar' })
  cnpj: string;

  @Column({ nullable: false, type: 'varchar' })
  tipo_cnpj: string;

  @Column({ nullable: false, type: 'varchar' })
  vaga_100_presencial_porto_real_rj: string;

  @Column({ nullable: false, type: 'varchar' })
  vaga_100_presencial_goiana_pe: string;

  @Column({ nullable: false, type: 'varchar' })
  vaga_100_presencial_betim_mg: string;
  
  @Column({ nullable: false, type: 'varchar' })
  vaga_100_presencial_sao_paulo: string;

  @Column({ nullable: false, type: 'varchar' })
  vaga_internacional: string;

  @Column({ nullable: false, type: 'varchar' })
  vaga_hibrida_betim: string;

  @Column({ nullable: false, type: 'varchar' })
  home_office: string;

  @Column({ nullable: true, type: 'varchar' })
  observacao: string;

  @Column({ type: 'boolean', default: false })
  foi_avaliado_recrutamento: boolean;

  @OneToOne(() => File)
  @JoinColumn()
  curriculo: File;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
