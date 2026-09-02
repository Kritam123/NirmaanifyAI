import { SetMetadata } from '@nestjs/common';
import { UserRole } from '@nirmaanify/types';
import { WORKSPACE_ROLES_KEY } from '../guards/workspace-access.guard';

export const RequireWorkspaceRoles = (...roles: UserRole[]) =>
  SetMetadata(WORKSPACE_ROLES_KEY, roles);
