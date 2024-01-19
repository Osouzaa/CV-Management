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
} from '@nestjs/common';
import { CandidateService } from './candidate.service';
import { CreateCandidateDto } from './dto/create-candidate.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { UpdateCandidateDto } from './dto/update-candidate.dto';
import { QueryCandidateDto } from './dto/query-candidate.dto';
import { Candidate } from 'src/database/entities/candidate.entity';

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
}
