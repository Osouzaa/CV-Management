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
} from '@nestjs/common';
import { CandidateService } from './candidate.service';
import { CreateCandidateDto } from './dto/create-candidate.dto';
import { FileInterceptor } from '@nestjs/platform-express';

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
  uploadCv(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({ fileType: 'application/pdf' })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    file: Express.Multer.File,
  ) {
    return this.candidateService.uploadCv(file, file.buffer);
  }

  @Get()
  findAll() {
    return this.candidateService.findAll();
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

  // @Patch(':id')
  // update(
  //   @Param('id') id: string,
  //   @Body() updateCandidateDto: UpdateCandidateDto,
  // ) {
  //   return this.candidateService.update(+id, updateCandidateDto);
  // }
}
