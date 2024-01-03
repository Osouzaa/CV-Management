export class CreateCandidateDto {
  id: number;
  cpf: string;
  nome: string;
  habilidades: string;
  idade: number;
  cidade: string;
  estado: string;
  avaliado?: boolean;
}
