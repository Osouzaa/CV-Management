import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseInterceptors,
  UploadedFile,
  ParseFilePipeBuilder,
  HttpStatus,
  Query,
  Delete,
} from '@nestjs/common';
import { CandidateService } from './candidate.service';
import { CreateCandidateDto } from './dto/create-candidate.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { UpdateCandidateDto } from './dto/update-candidate.dto';
import { QueryCandidateDto } from './dto/query-candidate.dto';
import { Candidate } from 'src/database/entities/candidate.entity';
import { NotFoundException, Res } from '@nestjs/common';
import { Response } from 'express';
import * as path from 'path';
import * as fs from 'fs';

@Controller('candidate')
export class CandidateController {
  constructor(private readonly candidateService: CandidateService) {}

  @Post()
  @UseInterceptors(FileInterceptor('curriculo'))
  create(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({ fileType: 'application/pdf' })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    curriculo: Express.Multer.File,
    @Body()
    createCandidateDto: CreateCandidateDto,
  ) {
    console.log(createCandidateDto.data_de_nascimento)
    return this.candidateService.create(createCandidateDto, curriculo);
  }

  @Post('uploadCv')
  @UseInterceptors(FileInterceptor('cv'))
  async uploadCv(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({ fileType: 'application/pdf' })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    createCandidateDto: CreateCandidateDto,
    file: Express.Multer.File,
  ) {
    return this.candidateService.uploadCv(
      file,
      file.buffer,
      createCandidateDto,
    );
  }

  @Get()
  async findAll(@Query() query?: QueryCandidateDto): Promise<Candidate[]> {
    return this.candidateService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.candidateService.findOne(+id);
  }
  @Get(':id/download-cv')
  async downloadCv(@Param('id') id: string, @Res() res: Response) {
    try {
      const candidate = await this.candidateService.findById(+id);

      if (!candidate || !candidate.curriculo) {
        throw new NotFoundException('Candidato ou currículo não encontrado.');
      }

      const filePath = path.join(
        __dirname,
        '../../src/uploads',
        candidate.curriculo.fileName,
      );
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=${path.basename(filePath)}`,
      );

      // Envie o arquivo como resposta
      const fileStream = fs.createReadStream(filePath);

      // Manipule possíveis erros durante o stream
      fileStream.on('error', (error) => {
        console.error('Erro durante o download:', error);
        res
          .status(500)
          .send({ message: 'Erro interno no servidor durante o download.' });
      });

      fileStream.pipe(res);
    } catch (error) {
      if (error instanceof NotFoundException) {
        res.status(404).send({ message: error.message });
      } else {
        res.status(500).send({ message: 'Erro interno no servidor.' });
      }
    }
  }

  // @Get('/skills/:skill')
  // async getCandidatesBySkill(@Param('skill') skill: string) {
  //   const candidates = await this.candidateService.findBySkill(skill);
  //   return candidates;
  // }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCandidateDto: UpdateCandidateDto,
  ) {
    return this.candidateService.update(+id, updateCandidateDto);
  }

  @Post('upload-excel')
  @UseInterceptors(FileInterceptor('file'))
  uploadSpreadsheets(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType:
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    file: Express.Multer.File,
  ) {
    return this.candidateService.uploadSpreadsheet(file);
  }
  @Get(':id/cv')
  async getCv(@Param('id') id: string, @Res() res: Response) {
    try {
      const candidate = await this.candidateService.findById(+id);

      if (!candidate || !candidate.curriculo) {
        throw new NotFoundException('Currículo do candidato não encontrado.');
      }

      const filePath = path.join(
        __dirname,
        '../../src/uploads',
        candidate.curriculo.fileName,
      );

      // Definir os cabeçalhos da resposta
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `inline; filename=${path.basename(filePath)}`,
      );

      // Enviar o arquivo como resposta
      const fileStream = fs.createReadStream(filePath);

      // Lidar com possíveis erros durante o stream
      fileStream.on('error', (error) => {
        console.error('Erro durante o download do currículo:', error);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
          message: 'Erro interno no servidor durante o download do currículo.',
        });
      });

      fileStream.pipe(res);
    } catch (error) {
      if (error instanceof NotFoundException) {
        res.status(HttpStatus.NOT_FOUND).send({ message: error.message });
      } else {
        res
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .send({ message: 'Erro interno no servidor.' });
      }
    }
  }

  @Post('/ping')
  async Ping() {
    return 'a';
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.candidateService.remove(id);
  }
}
