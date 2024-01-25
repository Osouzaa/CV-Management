import {
  BadRequestException,
  HttpException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCandidateDto } from './dto/create-candidate.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Candidate } from 'src/database/entities/candidate.entity';
import { Repository } from 'typeorm';
import * as path from 'path';
import { promises as fsPromises } from 'fs';
import { FilesService } from 'src/files/files.service';
import { UpdateCandidateDto } from './dto/update-candidate.dto';
import { QueryCandidateDto } from './dto/query-candidate.dto';
import { differenceInYears, parse } from 'date-fns';
import * as XLSX from 'xlsx';

@Injectable()
export class CandidateService {
  constructor(
    @InjectRepository(Candidate)
    private candidateRepository: Repository<Candidate>,
    private fileService: FilesService,
  ) {}

  formatarNomeProfissional(profissional: string): string {
    const codigoFormatado = profissional
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase())
      .join('');
    return codigoFormatado;
  }

  private CalculcarIdade = (data_de_nascimento: string) => {
    const dataNascimento = parse(data_de_nascimento, 'yyyy-MM-dd', new Date());
    const idade = differenceInYears(new Date(), dataNascimento);

    return idade;
  };

  async create(
    createCandidateDto: CreateCandidateDto,
    curriculo: Express.Multer.File,
  ) {
    try {
      if (await this.findByCpf(createCandidateDto.cpf)) {
        throw new BadRequestException('Candidato já registrado');
      }

      const codigoCandidate = this.formatarNomeProfissional(
        createCandidateDto.profissional,
      );

      const currentDate = new Date();
      const formattedDate = `${currentDate.getDate()}/${
        currentDate.getMonth() + 1
      }/${currentDate.getFullYear()}`;

      const observacaoDate = `[${formattedDate}] - ${createCandidateDto.observacao}`;

      const file = await this.uploadCv(
        curriculo,
        curriculo.buffer,
        createCandidateDto,
        codigoCandidate,
      );

      const resultAge = this.CalculcarIdade(
        createCandidateDto.data_de_nascimento,
      );

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

  async findAll(query?: QueryCandidateDto) {
    try {
      let options: any = {};
      if (query && query.idade) {
        options = {
          where: { idade: query.idade },
          relations: ['curriculo'],
        };
      } else {
        options = {
          relations: ['curriculo'],
        };
      }

      const candidates = await this.candidateRepository.find(options);

      return candidates;
    } catch (error) {
      throw new HttpException(
        error.message || 'Internal server error',
        error.status || 500,
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

  async uploadSpreadsheet(spreadsheet: Express.Multer.File) {
    try {
      const workbook = XLSX.read(spreadsheet.buffer);
  
      const result = await Promise.all(
        workbook.SheetNames.map(async (sheetName) => {
          const worksheet = workbook.Sheets[sheetName];
          const rows = XLSX.utils.sheet_to_json(worksheet) as any[];
  
          // Criar um objeto para armazenar os resultados por coluna
          const columnResults: { [key: string]: any } = {};
  
          // Iterar sobre as linhas e extrair os valores das colunas
          rows.forEach((row, rowIndex) => {
            Object.keys(row).forEach((columnName) => {
              // Criar a chave da coluna se não existir no objeto
              if (!columnResults[columnName]) {
                columnResults[columnName] = [];
              }
  
              // Adicionar o valor da célula ao array correspondente à coluna
              columnResults[columnName].push(row[columnName]);
            });
          });
  
          // Visualize os dados da planilha no console
          console.log('Dados da planilha:', columnResults);
  
          return columnResults;
        }),
      );
  
      console.log('Resultado do upload:', result);
      return result;
    } catch (error) {
      throw new HttpException(
        error.message || 'Erro interno no servidor',
        error.statusCode || 500,
      );
    }
  }
}
