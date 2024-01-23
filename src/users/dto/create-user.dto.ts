import {
  IsNotEmpty,
  IsString,
  MaxLength,
  IsEmail,
  MinLength,
  IsOptional,
  IsEnum,
  IsBoolean,
} from 'class-validator';
import { RoleEnum } from '../../enums/role.enum.';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(64)
  name: string;
  
  @IsNotEmpty()
  @IsString()
  @MaxLength(64)
  registration: string;

  @IsNotEmpty()
  @IsString()
  @IsEmail()
  @MaxLength(100)
  email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @MaxLength(64)
  password: string;

  @IsOptional()
  @IsEnum(RoleEnum)
  role: RoleEnum;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
