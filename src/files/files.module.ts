import { Module } from '@nestjs/common';
import { FilesService } from './files.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { File } from '../database/entities/file.entity';

@Module({
  imports: [TypeOrmModule.forFeature([File])],
  providers: [FilesService],
  exports: [FilesService]
})
export class FilesModule {}
