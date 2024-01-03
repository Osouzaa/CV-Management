import { Module } from '@nestjs/common';
import { CandidateService } from './candidate.service';
import { CandidateController } from './candidate.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Candidate } from 'src/database/entities/candidate.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Candidate])],
  controllers: [CandidateController],
  providers: [CandidateService],
})
export class CandidateModule {}
