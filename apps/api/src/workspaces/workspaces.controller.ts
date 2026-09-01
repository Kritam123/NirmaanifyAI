import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { WorkspacesService } from './workspaces.service';
import { CreateWorkspaceDto, InviteMemberDto } from './dto/workspace.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { WorkspaceAccessGuard } from '../common/guards/workspace-access.guard';
import { RequireWorkspaceRoles } from '../common/decorators/workspace-roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Workspaces')
@ApiBearerAuth()
@Controller('workspaces')
export class WorkspacesController {
  constructor(private readonly workspacesService: WorkspacesService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'List all workspaces for authenticated user' })
  async listWorkspaces(@CurrentUser('id') userId: string) {
    return this.workspacesService.listWorkspaces(userId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, WorkspaceAccessGuard)
  @ApiOperation({ summary: 'Get workspace details and members (Tenant Isolated)' })
  async getWorkspace(
    @Param('id') id: string,
    @CurrentUser('id') userId: string
  ) {
    return this.workspacesService.getWorkspaceById(id, userId);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a new workspace' })
  async createWorkspace(
    @Body() dto: CreateWorkspaceDto,
    @CurrentUser('id') userId: string
  ) {
    return this.workspacesService.createWorkspace(dto, userId);
  }

  @Get(':id/members')
  @UseGuards(JwtAuthGuard, WorkspaceAccessGuard)
  @ApiOperation({ summary: 'List members of a workspace' })
  async listMembers(
    @Param('id') id: string,
    @CurrentUser('id') userId: string
  ) {
    return this.workspacesService.listMembers(id, userId);
  }

  @Post(':id/invites')
  @UseGuards(JwtAuthGuard, WorkspaceAccessGuard)
  @RequireWorkspaceRoles('OWNER', 'ADMIN')
  @ApiOperation({ summary: 'Invite a member to a workspace (Owner/Admin only)' })
  async inviteMember(
    @Param('id') id: string,
    @Body() dto: InviteMemberDto,
    @CurrentUser('id') userId: string
  ) {
    return this.workspacesService.inviteMember(id, dto, userId);
  }

  @Delete(':id/members/:userId')
  @UseGuards(JwtAuthGuard, WorkspaceAccessGuard)
  @RequireWorkspaceRoles('OWNER', 'ADMIN')
  @ApiOperation({ summary: 'Remove a member from a workspace (Owner/Admin only)' })
  async removeMember(
    @Param('id') id: string,
    @Param('userId') targetUserId: string,
    @CurrentUser('id') requestingUserId: string
  ) {
    return this.workspacesService.removeMember(id, targetUserId, requestingUserId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, WorkspaceAccessGuard)
  @RequireWorkspaceRoles('OWNER', 'ADMIN')
  @ApiOperation({ summary: 'Delete workspace and cascade delete all projects (Owner/Admin only)' })
  async deleteWorkspace(
    @Param('id') id: string,
    @CurrentUser('id') userId: string
  ) {
    return this.workspacesService.deleteWorkspace(id, userId);
  }
}
