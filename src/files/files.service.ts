import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { File } from './entities/file.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class FilesService {
  constructor(
    @InjectRepository(File)
    private filesRepository: Repository<File>,
  ) {}
  async create(fileName: string) {
  
    const tempfile = this.filesRepository.create({ fileName });
   
    const file = await this.filesRepository.save(tempfile);

    return file;
  }

  async getCurriculo () {
    
  }
}
