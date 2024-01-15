import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCandidateDto {
  @IsNotEmpty({ message: "O campo profissional não pode estar vazio" })
  @IsString()
  profissional: string;

  @IsNotEmpty({ message: "O campo idade não pode estar vazio" })
  @IsString()
  idade: string;

  @IsNotEmpty({ message: "O campo status não pode estar vazio" })
  @IsString()
  status: string;

  @IsNotEmpty({ message: "O campo de CPF não pode estar vazio" })
  @IsString()
  cpf: string;

  @IsNotEmpty({ message: "O campo telefone não pode estar vazio" })
  @IsString()
  telefone: string;

  @IsNotEmpty({ message: "O campo cidade não pode estar vazio" })
  @IsString()
  cidade: string;

  @IsNotEmpty({ message: "O campo email não pode estar vazio" })
  @IsString()
  email: string;

  @IsNotEmpty({ message: "O campo vaga 100% presencial Porto Real RJ não pode estar vazio" })
  @IsString()
  vaga_100_presencial_porto_real_rj: string;

  @IsNotEmpty({ message: "O campo vaga 100% presencial Goiana PE não pode estar vazio" })
  @IsString()
  vaga_100_presencial_goiana_pe: string;

  @IsNotEmpty({ message: "O campo vaga 100% presencial Betim MG não pode estar vazio" })
  @IsString()
  vaga_100_presencial_betim_mg: string;

  @IsNotEmpty({ message: "O campo vaga híbrida Betim não pode estar vazio" })
  @IsString()
  vaga_hibrida_betim: string;

  @IsNotEmpty({ message: "O campo home office não pode estar vazio" })
  @IsString()
  home_office: string;

  @IsNotEmpty({ message: "O campo última empresa não pode estar vazio" })
  @IsString()
  ultima_empresa: string;

  @IsNotEmpty({ message: "O campo último salário não pode estar vazio" })
  @IsString()
  ultimo_salario: string;

  @IsNotEmpty({ message: "O campo target CLT não pode estar vazio" })
  @IsString()
  target_clt: string;

  @IsNotEmpty({ message: "O campo conhecimento de inglês não pode estar vazio" })
  @IsString()
  conhecimento_ingles: string;
}
