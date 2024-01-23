import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { jwtConfig } from './jwt/jwt.config';
import { UsersModule } from 'src/users/users.module';


@Module({
  imports: [
    JwtModule.registerAsync({ ...jwtConfig, global: true }),
    UsersModule,
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}