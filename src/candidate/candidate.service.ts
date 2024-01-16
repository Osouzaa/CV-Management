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

@Injectable()
export class CandidateService {
  constructor(
    @InjectRepository(Candidate)
    private candidateRepository: Repository<Candidate>,
    private fileService: FilesService,
  ) {}

  async create(
    createCandidateDto: CreateCandidateDto,
    curriculo: Express.Multer.File,
  ) {
    try {
      if (await this.findByCpf(createCandidateDto.cpf)) {
        throw new BadRequestException('Candidato já registrado');
      }

      const file = await this.uploadCv(
        curriculo,
        curriculo.buffer,
        createCandidateDto,
      );

      const tempCandidate = this.candidateRepository.create({
        ...createCandidateDto,
        curriculo: file,
      });

      const candidate = await this.candidateRepository.save(tempCandidate);

      return candidate;
    } catch (error) {
      throw new HttpException(
        error.message || 'Internal server error',
        error.statusCode || 500,
      );
    }
  }

  async uploadCv(
    file: Express.Multer.File,
    fileBuffer: Buffer,
    createCandidateDto: CreateCandidateDto,
  ) {
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new BadRequestException('Arquivo muito grande');
    }

    const fileName = `${createCandidateDto.profissional
      .replace(/\s/g, '_')
      .toLowerCase()}.pdf`;

    const uploadPath = path.join(__dirname, '../../src/uploads', fileName);

    await fsPromises.writeFile(uploadPath, fileBuffer);

    return await this.fileService.create(fileName);
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

  async findAll() {
    try {
      return this.candidateRepository.find();
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
      const user = await this.candidateRepository.findOneBy({ id });

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

  // async update(id: number, updateCandidateDto: UpdateCandidateDto) {
  //   try {
  //     await this.findOne(id);

  //     const tempAffected = this.candidateRepository.create(updateCandidateDto);

  //     const affected = await this.candidateRepository.update(id, tempAffected);

  //     if (!affected) {
  //       throw new HttpException('Algo deu errado com a atualização.', 400);
  //     }

  //     return await this.findById(id);
  //   } catch (error) {
  //     throw new HttpException(
  //       error.message || 'Internal server error',
  //       error.status || 500,
  //     );
  //   }
  // }

  remove(id: number) {
    return `This action removes a #${id} candidate`;
  }
}
