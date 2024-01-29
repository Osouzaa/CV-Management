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
import { Between, Repository } from 'typeorm';
import * as path from 'path';
import { promises as fsPromises } from 'fs';
import { FilesService } from 'src/files/files.service';
import { UpdateCandidateDto } from './dto/update-candidate.dto';
import { QueryCandidateDto } from './dto/query-candidate.dto';
import * as XLSX from 'xlsx';
import { formatarDataNascimento } from 'src/utils/dateUtils';
import { formatarCPF } from 'src/utils/cpfUtils';
import { formatarTelefone } from 'src/utils/phoneUtils';
import { formatarDinheiro } from 'src/utils/salarioUtils';
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
                const profissional = row['Nome completo:'];
                const email = row['E-mail pessoal:'];
                const dataNascimentoFormatada = formatarDataNascimento(
                  row['Data de Nascimento:'],
                );
                const cpfOriginal =
                  row['CPF válido ex: 000.000.000-00'].toString();
                const cpfFormatado = formatarCPF(cpfOriginal);
                const telefoneOriginal =
                  row['Contato ex:.(00) 0000-0000'].toString();
                const telefoneFormatado = formatarTelefone(telefoneOriginal);
                const cidade = row['Cidade que reside:'];
                const uf = row['UF:'];
                const experiencia_ramo_automotivo =
                  row['Experiência no segmento automotivo:'];
                const modalidade_atual = row['Modalidade Atual:'];
                const empresa_atual = row['Nome da empresa Atual:'];
                const tipo_desejado_linkedin =
                  row['Tipo desejado (vagas abertas no Linkedin):'];
                const nivel_funcao = row['Nível atual na função:'];
                const formacao = row['Formação:'];
                const interesse_imediato =
                  row['Possui interesse IMEDIATO na ocupação da vaga:'];
                const entrevista_online =
                  row['Disponibilidade ENTREVISTA on-line:'];
                const teste_tecnico =
                  row['Disponibilidade TESTE TÉCNICO on-line (seg a sex). '];
                const conhecimento_ingles =
                  row['Nível de idioma para conversação: [Inglês]'];
                const pretensao_salarial =
                  row['Pretensão salarial no regime CLT. ex: 0.000,00'];
                const salarioFormatado = formatarDinheiro(pretensao_salarial);
                const pretensao_pj =
                  row['Pretensão salarial no regime PJ, valor hora. ex: 00hs.'];
                const salarioPJ = formatarDinheiro(pretensao_pj);
                const cnpj = row['Possui CNPJ Ativo?'];
                const tipo_cnpj = row['Tipo:'];
                const vaga_100_presencial_betim_mg =
                  row['Local: [Presencial Betim-Mg]'];
                const vaga_100_presencial_porto_real_rj =
                  row['Local: [Presencial Porto Real-Rj]'];
                const vaga_100_presencial_goiana_pe =
                  row['Local: [Presencial Goiana-Pe]'];
                const home_office = row['Local: [Home Office]'];
                const vaga_internacional = row['Local: [Internacional]'];
                const observacao = row['Observação:'];

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
                  vaga_100_presencial_porto_real_rj,
                  vaga_100_presencial_goiana_pe,
                  home_office,
                  vaga_internacional,
                  observacao,
                  esta_empregado: 'Não',
                  vaga_hibrida_betim: 'Não',
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
            curriculo.buffer, // Acesse 'buffer' somente se 'curriculo' estiver definido
            createCandidateDto,
            codigoCandidate,
          )
        : null; // Caso 'curriculo' seja indefinido, 'file' também será nulo

      const resultAge = calcularIdade(createCandidateDto.data_de_nascimento);

      const tempCandidate = this.candidateRepository.create({
        ...createCandidateDto,
        curriculo: file, // Atribui 'file' como curriculo se 'file' não for nulo
        idade: resultAge,
        codigoCandidate,
        observacao: observacaoDate,
      });

      const candidate = await this.candidateRepository.save(tempCandidate);

      return candidate;
    } catch (error) {
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

      const fileName = `${createCandidateDto.profissional
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

      if (query) {
        for (const key in query) {
          if (query.hasOwnProperty(key) && query[key]) {
            if (key === 'minIdade') {
              whereConditions.idade = whereConditions.idade || {};
              whereConditions.idade['$gte'] = Number(query.minIdade);
            } else if (key === 'maxIdade') {
              whereConditions.idade = whereConditions.idade || {};
              whereConditions.idade['$lte'] = Number(query.maxIdade);
            } else if (key === 'minPretensaoSalarial') {
              whereConditions.pretensaoSalarial =
                whereConditions.pretensaoSalarial || {};
              whereConditions.pretensaoSalarial['$gte'] = Number(
                query.minPretensaoSalarial,
              );
            } else if (key === 'maxPretensaoSalarial') {
              whereConditions.pretensaoSalarial =
                whereConditions.pretensaoSalarial || {};
              whereConditions.pretensaoSalarial['$lte'] = Number(
                query.maxPretensaoSalarial,
              );
            } else if (key === 'minPretensaoPJ') {
              whereConditions.pretensao_pj = whereConditions.pretensao_pj || {};
              whereConditions.pretensao_pj['$gte'] = Number(
                query.minPretensaoPJ,
              );
            } else if (key === 'maxPretensaoPJ') {
              whereConditions.pretensao_pj = whereConditions.pretensao_pj || {};
              whereConditions.pretensao_pj['$lte'] = Number(
                query.maxPretensaoPJ,
              );
            } else {
              whereConditions[key] = query[key];
            }
          }
        }

        if (query.minIdade && query.maxIdade) {
          whereConditions.idade = whereConditions.idade || {};
          whereConditions.idade = Between(
            Number(query.minIdade),
            Number(query.maxIdade),
          );
        }

        if (query.minPretensaoSalarial && query.maxPretensaoSalarial) {
          whereConditions.pretensaoSalarial =
            whereConditions.pretensaoSalarial || {};
          whereConditions.pretensaoSalarial = Between(
            Number(query.minPretensaoSalarial),
            Number(query.maxPretensaoSalarial),
          );
        }

        if (query.minPretensaoPJ && query.maxPretensaoPJ) {
          whereConditions.pretensao_pj = whereConditions.pretensao_pj || {};
          whereConditions.pretensao_pj = Between(
            Number(query.minPretensaoPJ),
            Number(query.maxPretensaoPJ),
          );
        }
      }

      return this.candidateRepository.find({
        ...commonOptions,
        where: whereConditions,
      });
    } catch (error) {
      throw new HttpException(
        error.message || 'Erro interno no servidor',
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

  remove(id: number) {
    return `This action removes a #${id} candidate`;
  }
}
