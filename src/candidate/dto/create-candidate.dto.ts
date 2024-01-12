import {  IsNotEmpty, IsString } from 'class-validator';

export class CreateCandidateDto {
  @IsString()
  profissional: string;

  @IsString()
  idade: string;

  @IsString()
  status: string;

  @IsNotEmpty({message: "O campo de CPF não pode estar vazio"})
  @IsString()
  cpf: string;

  @IsString()
  telefone: string;

  @IsString()
  cidade: string;

  @IsString()
  email: string;

  @IsString()
  vaga_100_presencial_porto_real_rj: string;

  @IsString()
  vaga_100_presencial_goiana_pe: string;

  @IsString()
  vaga_100_presencial_betim_mg: string;

  @IsString()
  vaga_hibrida_betim: string;

  @IsString()
  home_office: string;

  @IsString()
  ultima_empresa: string;

  @IsString()
  ultimo_salario: string;

  @IsString()
  target_clt: string;

  @IsString()
  conhecimento_ingles: string;
}
