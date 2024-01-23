import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RoleEnum } from 'src/enums/role.enum.';
import { RolesGuard } from 'src/auth/guards/roles.guard';

export function Auth(roles?: RoleEnum[]) {

  return applyDecorators(
    SetMetadata('roles', roles),
    UseGuards(AuthGuard, RolesGuard),
  );
}
