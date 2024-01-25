import {IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCandidateDto {
  @IsNotEmpty({ message: 'O campo profissional não pode estar vazio' })
  @IsString()
  profissional: string;

  @IsNotEmpty({ message: 'O campo Data de Nascimento não pode estar vazio' })
  @IsString()
  data_de_nascimento: string;


  @IsNotEmpty({ message: 'O campo de CPF não pode estar vazio' })
  @IsString()
  cpf: string;

  @IsNotEmpty({ message: 'O campo cidade não pode estar vazio' })
  @IsString()
  cidade: string;

  @IsNotEmpty({ message: 'O campo UF não pode estar vazio' })
  @IsString()
  uf: string;

  @IsNotEmpty({ message: 'O campo Contato não pode estar vazio' })
  @IsString()
  telefone: string;

  @IsNotEmpty({ message: 'O campo email não pode estar vazio' })
  @IsString()
  email: string;

  // Content 
  @IsNotEmpty({ message: 'O campo Está Empregado não pode estar vazio' })
  @IsString()
  esta_empregado: string;

  empresa_atual: string;

  @IsNotEmpty({ message: 'O campo Experiencia no ramo automotivo não pode estar vazio' })
  @IsString()
  experiencia_ramo_automotivo: string;

  @IsNotEmpty({ message: 'O campo Modalidade Atual não pode estar vazio' })
  @IsString()
  modalidade_atual: string;

  @IsNotEmpty({ message: 'O campo Tipo desejado de vaga não pode estar vazio' })
  @IsString()
  tipo_desejado_linkedin: string;

  @IsNotEmpty({ message: 'O campo Nível da função não pode estar vazio' })
  @IsString()
  nivel_funcao: string;

  @IsNotEmpty({ message: 'O campo Formação não pode estar vazio' })
  @IsString()
  formacao: string;

  @IsNotEmpty({ message: 'O campo Interesse Imediato não pode estar vazio' })
  @IsString()
  interesse_imediato: string;


  @IsNotEmpty({ message: 'O campo de Entrevista Online não pode estar vazio' })
  @IsString()
  entrevista_online: string;

  @IsNotEmpty({ message: 'O campo de Teste Técnico não pode estar vazio' })
  @IsString()
  teste_tecnico: string;

  @IsNotEmpty({ message: 'O campo de Conhecimento em inglês não pode estar vazio' })
  @IsString()
  conhecimento_ingles: string;

  @IsNotEmpty({ message: 'O campo de pretensão salarial não pode estar vazio' })
  @IsString()
  pretensao_salarial: string;

  @IsNotEmpty({ message: 'O campo de pretensão salarial não pode estar vazio' })
  @IsString()
  pretensao_pj: string;

  @IsNotEmpty({ message: 'O campo de CNPJ não pode estar vazio' })
  @IsString()
  cnpj: string;

  @IsNotEmpty({ message: 'O campo de Tipo CNPJ não pode estar vazio' })
  @IsString()
  tipo_cnpj: string;

  @IsNotEmpty({
    message: 'O campo vaga 100% presencial Porto Real RJ não pode estar vazio',
  })
  @IsString()
  vaga_100_presencial_porto_real_rj: string;

  @IsNotEmpty({
    message: 'O campo vaga 100% presencial Goiana PE não pode estar vazio',
  })
  @IsString()
  vaga_100_presencial_goiana_pe: string;

  @IsNotEmpty({
    message: 'O campo vaga 100% presencial Betim MG não pode estar vazio',
  })
  @IsString()
  vaga_100_presencial_betim_mg: string;

  @IsNotEmpty({ message: 'O campo home office não pode estar vazio' })
  @IsString()
  vaga_internacional: string;

  @IsNotEmpty({ message: 'O campo vaga híbrida Betim não pode estar vazio' })
  @IsString()
  vaga_hibrida_betim: string;

  @IsNotEmpty({ message: 'O campo home office não pode estar vazio' })
  @IsString()
  home_office: string;

  @IsOptional()
  observacao: string;

  @IsOptional()
  foi_avaliado_recrutamento?: boolean;
}
