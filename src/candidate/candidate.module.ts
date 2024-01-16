import { Module } from '@nestjs/common';
import { CandidateService } from './candidate.service';
import { CandidateController } from './candidate.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Candidate } from 'src/database/entities/candidate.entity';
import { FilesModule } from 'src/files/files.module';


@Module({
  imports: [TypeOrmModule.forFeature([Candidate]), FilesModule], 
  controllers: [CandidateController],
  providers: [CandidateService],
})
export class CandidateModule {}
