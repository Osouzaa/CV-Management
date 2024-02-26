import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCandidateDto } from './dto/create-candidate.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Candidate } from 'src/database/entities/candidate.entity';
import { Between, In, Not, Repository } from 'typeorm';
import * as path from 'path';
import { promises as fsPromises } from 'fs';
import { FilesService } from 'src/files/files.service';
import { UpdateCandidateDto } from './dto/update-candidate.dto';
import { QueryCandidateDto } from './dto/query-candidate.dto';
import * as XLSX from 'xlsx';
import { formatarDataNascimento } from 'src/utils/dateUtils';
import { formatarCPF } from 'src/utils/cpfUtils';
import { formatarTelefone } from 'src/utils/phoneUtils';
import { calcularIdade } from 'src/utils/idadeUtils';
import { formatarNomeProfissional } from 'src/utils/nomeProfissional.Utils';

@Injectable()
export class CandidateService {
  constructor(
    @InjectRepository(Candidate)
    private candidateRepository: Repository<Candidate>,
    private fileService: FilesService,
  ) {}

  async uploadSpreadsheet(spreadsheet: Express.Multer.File) {
    try {
      const workbook = XLSX.read(spreadsheet.buffer);

      const result = await Promise.all(
        workbook.SheetNames.map(async (sheetName) => {
          const worksheet = workbook.Sheets[sheetName];
          const rows = XLSX.utils.sheet_to_json(worksheet) as any[];

          const uploadResults = await Promise.all(
            rows.map(async (row) => {
              try {
                console.log('Row:', row);
                const capitalizeStrings = (obj: Record<string, string>) => {
                  const newObj: Record<string, string> = {};
                  for (const key in obj) {
                    if (Object.prototype.hasOwnProperty.call(obj, key)) {
                      newObj[key] =
                        typeof obj[key] === 'string'
                          ? obj[key].charAt(0).toUpperCase() +
                            obj[key].slice(1).toLowerCase()
                          : obj[key];
                    }
                  }
                  return newObj;
                };

                const capitalizedRow = capitalizeStrings(row);

                const profissional = capitalizedRow['Nome completo:'];
                const email = capitalizedRow['E-mail pessoal:'];
                const dataNascimentoFormatada = formatarDataNascimento(
                  row['Data de Nascimento:'],
                );
                const cpfOriginal =
                  capitalizedRow['CPF válido ex: 000.000.000-00'].toString();
                const cpfFormatado = formatarCPF(cpfOriginal);
                const telefoneOriginal =
                  capitalizedRow['Contato ex:.(00) 0000-0000'].toString();
                const telefoneFormatado = formatarTelefone(telefoneOriginal);
                const cidade = capitalizedRow['Cidade que reside:'];
                const uf = capitalizedRow['UF:'].toUpperCase();
                const experiencia_ramo_automotivo =
                  capitalizedRow['Experiência no segmento automotivo:'];
                const modalidade_atual = capitalizedRow['Modalidade Atual:'];
                const empresa_atual = capitalizedRow['Nome da empresa Atual:'];
                const tipo_desejado_linkedin =
                  capitalizedRow['Tipo desejado (vagas abertas no Linkedin):'];
                const nivel_funcao = capitalizedRow['Nível atual na função:'];
                const formacao = capitalizedRow['Formação:'];
                const interesse_imediato =
                  capitalizedRow[
                    'Possui interesse IMEDIATO na ocupação da vaga:'
                  ];
                const entrevista_online =
                  capitalizedRow['Disponibilidade ENTREVISTA on-line:'];
                const teste_tecnico =
                  capitalizedRow[
                    'Disponibilidade TESTE TÉCNICO on-line (seg a sex). '
                  ];
                const conhecimento_ingles =
                  capitalizedRow['Nível de idioma para conversação: [Inglês]'];
                const pretensao_salarial =
                  row['Pretensão salarial no regime CLT. ex: 0.000,00'];

                const pretensao_pj =
                  row['Pretensão salarial no regime PJ, valor hora. ex: 00hs.'];

                const cnpj = capitalizedRow['Possui CNPJ Ativo?'];
                const tipo_cnpj = capitalizedRow['Tipo:'];
                const vaga_100_presencial_betim_mg =
                  capitalizedRow['Local: [Presencial Betim-Mg]'];
                const vaga_100_presencial_porto_real_rj =
                  capitalizedRow['Local: [Presencial Porto Real-Rj]'];
                const vaga_100_presencial_goiana_pe =
                  capitalizedRow['Local: [Presencial Goiana-Pe]'];
                const home_office = capitalizedRow['Local: [Home Office]'];
                const vaga_internacional =
                  capitalizedRow['Local: [Internacional]'];
                const observacao = capitalizedRow['Observação:'];

                const esta_empregado = 'Não';
                const vaga_hibrida_betim = 'Não';

                const candidateData: CreateCandidateDto = {
                  profissional,
                  email,
                  data_de_nascimento: dataNascimentoFormatada,
                  cpf: cpfFormatado,
                  telefone: telefoneFormatado,
                  cidade,
                  uf,
                  experiencia_ramo_automotivo,
                  modalidade_atual,
                  empresa_atual,
                  tipo_desejado_linkedin,
                  nivel_funcao,
                  formacao,
                  interesse_imediato,
                  entrevista_online,
                  teste_tecnico,
                  conhecimento_ingles,
                  pretensao_salarial,
                  pretensao_pj,
                  cnpj,
                  tipo_cnpj,
                  vaga_100_presencial_betim_mg,
                  vaga_100_presencial_sao_paulo: '',
                  vaga_100_presencial_porto_real_rj,
                  vaga_100_presencial_goiana_pe,
                  home_office,
                  vaga_internacional,
                  observacao,
                  esta_empregado,
                  vaga_hibrida_betim,
                  genero: '',
                  resumoProfissional: '',
                  conhecimento_frances: '',
                  conhecimento_italiano: '',
                  conhecimento_espanhol: ''
                };
                const candidate = await this.create(candidateData);
                return { candidate, success: true };
              } catch (error) {
                return { row, error, success: false };
              }
            }),
          );

          return { sheetName, uploadResults };
        }),
      );
      return result;
    } catch (error) {
      throw new HttpException(
        error.message || 'Erro interno no servidor',
        error.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async create(
    createCandidateDto: CreateCandidateDto,
    curriculo?: Express.Multer.File,
  ) {
    try {
      if (await this.findByCpf(createCandidateDto.cpf)) {
        throw new BadRequestException('Candidato já registrado');
      }

      const codigoCandidate = formatarNomeProfissional(
        createCandidateDto.profissional,
      );

      const currentDate = new Date();
      const formattedDate = `${currentDate.getDate()}/${
        currentDate.getMonth() + 1
      }/${currentDate.getFullYear()}`;

      const observacaoDate = `[${formattedDate}] - ${createCandidateDto.observacao}`;

      const file = curriculo
        ? await this.uploadCv(
            curriculo,
            curriculo.buffer, 
            createCandidateDto,
            codigoCandidate,
          )
        : null; 

      const resultAge = calcularIdade(createCandidateDto.data_de_nascimento);

      const tempCandidate = this.candidateRepository.create({
        ...createCandidateDto,
        curriculo: file, 
        idade: resultAge,
        codigoCandidate,
        observacao: observacaoDate,
      });

      const candidate = await this.candidateRepository.save(tempCandidate);

      return candidate;
    } catch (error) {
      console.log(error.message)
      throw new HttpException(
        error.message || 'Erro interno no servidor',
        error.statusCode || 500,
      );
    }
  }

  async uploadCv(
    file: Express.Multer.File,
    fileBuffer: Buffer,
    createCandidateDto: CreateCandidateDto,
    codigoCandidate?: string,
  ) {
    try {
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        throw new BadRequestException('Arquivo muito grande');
      }

      const fileName = `Tecnocar - ${createCandidateDto.profissional
        .replace(/\s/g, '_')
        .toLowerCase()}_${codigoCandidate}.pdf`;

      const uploadPath = path.join(__dirname, '../../src/uploads', fileName);

      await fsPromises.writeFile(uploadPath, fileBuffer);

      return await this.fileService.create(fileName);
    } catch (error) {
      const errorMessage = error.message || 'Erro interno no servidor';
      const statusCode = error.statusCode || 500;
      throw new HttpException(errorMessage, statusCode);
    }
  }

  async findByCpf(cpf: string) {
    try {
      return this.candidateRepository.findOneBy({ cpf });
    } catch (error) {
      throw new HttpException(
        error.message || 'Internal server error',
        error.status || 500,
      );
    }
  }

  async findAll(query?: QueryCandidateDto): Promise<Candidate[]> {
    try {
      const commonOptions = {
        relations: ['curriculo'],
      };

      let whereConditions: any = {};
      const queries: Promise<Candidate[]>[] = [];

      if (query.foi_avaliado_recrutamento) {
        whereConditions.foi_avaliado_recrutamento =
          query.foi_avaliado_recrutamento;
      }

      if (query) {
        // Verifica e adiciona a consulta de UF
        if (query.uf && typeof query.uf === 'string') {
          if (query.uf.toLowerCase() === 'outros') {
            whereConditions.uf = Not(In(['SP', 'MG', 'RJ', 'PE']));
          } else {
            const ufSelected = query.uf.split(',').map((uf) => uf.trim());
            whereConditions.uf = In(ufSelected);
          }
        }

        if (query) {
          // Verifica e adiciona a consulta de nivel_funcao
          if (query.nivel_funcao && typeof query.nivel_funcao === 'string') {
            const nivelFuncao = query.nivel_funcao.toLowerCase();
            if (nivelFuncao === 'júnior') {
              // Se for junior, busca junior, senior e pleno
              whereConditions.nivel_funcao = In(['Júnior', 'Senior', 'Pleno']);
            } else if (nivelFuncao === 'pleno') {
              // Se for senior, busca senior e pleno
              whereConditions.nivel_funcao = In(['Senior', 'Pleno']);
            } else if (nivelFuncao === 'senior') {
              // Se for pleno, busca apenas pleno
              whereConditions.nivel_funcao = 'Senior';
            }
          }
          queries.push(
            this.candidateRepository.find({
              ...commonOptions,
              where: whereConditions,
            }),
          );
        }

        if (query) {
          if (
            query.conhecimento_ingles &&
            typeof query.conhecimento_ingles === 'string'
          ) {
            const niveisDeIngles = query.conhecimento_ingles
              .split(',')
              .map((nivel) => nivel.trim());
            whereConditions.conhecimento_ingles = In(niveisDeIngles);
          }
        }

        // Verifica e adiciona as consultas de pretensão salarial
        if (query.minPretensaoSalarial && query.maxPretensaoSalarial) {
          queries.push(
            this.candidateRepository.find({
              ...commonOptions,
              where: {
                pretensao_salarial: Between(
                  Number(query.minPretensaoSalarial),
                  Number(query.maxPretensaoSalarial),
                ),
                ...whereConditions,
              },
            }),
          );
        }

        // Verifica e adiciona as consultas de pretensão PJ
        if (query.minPretensaoPJ && query.maxPretensaoPJ) {
          queries.push(
            this.candidateRepository.find({
              ...commonOptions,
              where: {
                pretensao_pj: Between(
                  Number(query.minPretensaoPJ),
                  Number(query.maxPretensaoPJ),
                ),
                ...whereConditions,
              },
            }),
          );
        }

        // Se não houver outras consultas, adiciona a consulta com as condições
        if (queries.length === 0) {
          for (const key in query) {
            if (query.hasOwnProperty(key) && query[key]) {
              if (key === 'minIdade') {
                whereConditions.idade = whereConditions.idade || {};
                whereConditions.idade['$gte'] = Number(query.minIdade);
              } else if (key === 'maxIdade') {
                whereConditions.idade = whereConditions.idade || {};
                whereConditions.idade['$lte'] = Number(query.maxIdade);
              } else {
                whereConditions[key] = query[key];
              }
            }
          }
          queries.push(
            this.candidateRepository.find({
              ...commonOptions,
              where: whereConditions,
            }),
          );
        }
      }

      // Aguarde todas as consultas serem resolvidas
      const results = await Promise.all(queries);

      // Combine os resultados e remova duplicatas
      const combinedResults = results.reduce(
        (acc, curr) => acc.concat(curr),
        [],
      );
      const uniqueResults = Array.from(
        new Set(combinedResults.map((candidate) => candidate.id)),
      ).map((candidateId) =>
        combinedResults.find((candidate) => candidate.id === candidateId),
      );

      // Retorne os resultados únicos
      return uniqueResults;
    } catch (error) {
      console.error(
        error.message || 'Internal server error',
        error.stack || '',
      );
      throw new HttpException(
        error.message || 'Internal server error',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findOne(id: number) {
    try {
      const candidateFound = await this.candidateRepository.findOne({
        where: { id },
      });
      if (!candidateFound) {
        throw new NotFoundException('Candidato nao encotrado.');
      }

      return candidateFound;
    } catch (error) {
      throw new HttpException(
        error.message || 'Internal server error',
        error.status || 500,
      );
    }
  }

  async findById(id: number) {
    try {
      const user = await this.candidateRepository.findOne({
        where: { id },
        relations: ['curriculo'],
      });

      if (!user) {
        throw new HttpException('Candidato não encontrado.', 404);
      }

      return user;
    } catch (error) {
      throw new HttpException(
        error.message || 'Internal server error.',
        error.status || 500,
      );
    }
  }

  // async findBySkill(skill: string): Promise<Candidate[]> {
  //   try {
  //     const candidates = await this.candidateRepository.find({
  //       where: {
  //         habilidades: Like(`%${skill}%`),
  //       },
  //     });

  //     return candidates;
  //   } catch (error) {
  //     throw new Error('Erro ao buscar candidatos por habilidade');
  //   }
  // }

  async update(id: number, updateCandidateDto: UpdateCandidateDto) {
    try {
      await this.findOne(id);

      const tempAffected = this.candidateRepository.create(updateCandidateDto);

      const affected = await this.candidateRepository.update(id, tempAffected);

      if (!affected) {
        throw new HttpException('Algo deu errado com a atualização.', 400);
      }

      return await this.findById(id);
    } catch (error) {
      throw new HttpException(
        error.message || 'Internal server error',
        error.status || 500,
      );
    }
  }

  async remove(id: number) {
    try {
      const candidate = await this.findById(id);
      if (!candidate) {
        throw new HttpException('Candidate não encontrado', 404);
      }
      await this.candidateRepository.delete({ id });

      return {
        message: "Candidato removido com sucesso!"
      }
    } catch (error) {
      throw new HttpException(
        error.message || 'Internal server error',
        error.status || 500,
      );
    }
  }
}
