import * as bcrypt from 'bcryptjs';
import { Injectable, HttpException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { LoginDto } from './dto/login.dto';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(payload: CreateUserDto) {
    try {
      const isRegistrationAvailable =
        await this.usersService.findByRegistration(payload.registration);

      if (isRegistrationAvailable) {
        throw new HttpException('Matricula ja em uso.', 400);
      }

      const newUser = await this.usersService.create(payload);

      return newUser;
    } catch (error) {
      throw new HttpException(
        error.message || 'Internal server error',
        error.status || 500,
      );
    }
  }

  async login(payload: LoginDto) {
    try {
      const user = await this.usersService.findByRegistration(payload.registration);

      if (!user.isActive) {
        throw new HttpException('Usuario esta desativado', 400);
      }

      if (!user) {
        throw new HttpException('E-mail ou senha invalida.', 401);
      }

      const { id, name, email, password, role, isActive } = user;

      const isPasswordValid = await bcrypt.compare(payload.password, password);

      if (!isPasswordValid) {
        throw new HttpException('E-mail ou senha invalida.', 401);
      }

      const tokenPayload = {
        userId: id,
        userName: name,
        userRole: role,
        isActive,
        userEmail: email,
      };

      return {
        data: {
          id,
          name,
          email,
          isActive,
        },
        token: await this.jwtService.signAsync(tokenPayload),
      };
    } catch (error) {
      console.log("error login ", error)
      throw new HttpException(
        error.message || 'Internal server error',
        error.status || 500,
      );
    }
  }
}
