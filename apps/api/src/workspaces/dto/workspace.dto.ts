import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsIn } from 'class-validator';
import { UserRole } from '@nirmaanify/types';

export class CreateWorkspaceDto {
  @ApiProperty({ example: 'Acme SaaS Corp' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional({ example: 'acme-saas' })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  isPersonal?: boolean;
}

export class InviteMemberDto {
  @ApiProperty({ example: 'sarah.engineer@acme.com' })
  @IsString()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({ enum: ['ADMIN', 'DEVELOPER', 'EDITOR', 'VIEWER', 'MEMBER'], default: 'DEVELOPER' })
  @IsString()
  @IsIn(['ADMIN', 'DEVELOPER', 'EDITOR', 'VIEWER', 'MEMBER'])
  role!: UserRole;
}

export class UpdateMemberRoleDto {
  @ApiProperty({ enum: ['ADMIN', 'DEVELOPER', 'EDITOR', 'VIEWER', 'MEMBER'], example: 'ADMIN' })
  @IsString()
  @IsIn(['ADMIN', 'DEVELOPER', 'EDITOR', 'VIEWER', 'MEMBER'])
  role!: UserRole;
}
