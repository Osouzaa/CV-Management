import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { CandidateModule } from './candidate/candidate.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), DatabaseModule, CandidateModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
