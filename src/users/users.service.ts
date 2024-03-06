import { HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Repository } from 'typeorm';
import { User } from '../database/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    try {
      const tempUser = this.usersRepository.create(createUserDto);

      const user = await this.usersRepository.save(tempUser);

      return user;
    } catch (error) {
      throw new HttpException(
        error.message || 'Internal server error.',
        error.status || 500,
      );
    }
  }

  async findByRegistration(registration: string) {
    try {
      const user = await this.usersRepository.findOne({
        where: { registration },
      });

      return user;
    } catch (error) {
      throw new HttpException(
        error.message || 'Internal server error.',
        error.status || 500,
      );
    }
  }

  async findAll() {
    try {
      return await this.usersRepository.find({
        select: [
          'id',
          'name',
          'email',
          'role',
          'createdAt',
          'registration',
          'isActive',
          'password',
        ],
      });
    } catch (error) {
      console.log('error ', error);
      throw new Error('Erro ao buscar usuários');
    }
  }

  async findOne(id: number) {
    try {
      const user = await this.usersRepository.findOneBy({ id });
      if (!user) {
        throw new NotFoundException(`Usuário com ID #${id} não encontrado`);
      }
      return user;
    } catch (error) {
      throw new Error('Erro ao buscar usuário por ID');
    }
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    try {
      const user = await this.usersRepository.findOneBy({ id });
      if (!user) {
        throw new NotFoundException(`Usuário com ID #${id} não encontrado`);
      }

      this.usersRepository.merge(user, updateUserDto);
      return await this.usersRepository.save(user);
    } catch (error) {
      throw new Error('Erro ao atualizar usuário');
    }
  }

  async remove(id: number) {
    try {
      const result = await this.usersRepository.delete(id);
      if (result.affected === 0) {
        throw new NotFoundException(`Usuário com ID #${id} não encontrado`);
      }
      return `Usuário com ID #${id} removido com sucesso`;
    } catch (error) {
      throw new Error('Erro ao remover usuário');
    }
  }
}
