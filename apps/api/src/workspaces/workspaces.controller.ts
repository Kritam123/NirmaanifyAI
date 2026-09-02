import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { WorkspacesService } from './workspaces.service';
import { CreateWorkspaceDto, InviteMemberDto, UpdateMemberRoleDto } from './dto/workspace.dto';
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

  @Patch(':id/members/:userId')
  @UseGuards(JwtAuthGuard, WorkspaceAccessGuard)
  @RequireWorkspaceRoles('OWNER', 'ADMIN')
  @ApiOperation({ summary: 'Update member role and permissions (Owner/Admin only)' })
  async updateMemberRole(
    @Param('id') id: string,
    @Param('userId') targetUserId: string,
    @Body() dto: UpdateMemberRoleDto,
    @CurrentUser('id') requestingUserId: string
  ) {
    return this.workspacesService.updateMemberRole(id, targetUserId, dto.role, requestingUserId);
  }

  @Delete(':id/members/:userId')
  @UseGuards(JwtAuthGuard, WorkspaceAccessGuard)
  @RequireWorkspaceRoles('OWNER', 'ADMIN')
  @ApiOperation({ summary: 'Kick or remove a member from a workspace (Owner/Admin only)' })
  async removeMember(
    @Param('id') id: string,
    @Param('userId') targetUserId: string,
    @CurrentUser('id') requestingUserId: string
  ) {
    return this.workspacesService.removeMember(id, targetUserId, requestingUserId);
  }

  @Post(':id/leave')
  @UseGuards(JwtAuthGuard, WorkspaceAccessGuard)
  @ApiOperation({ summary: 'Leave a workspace (Voluntary member self-removal)' })
  async leaveWorkspace(
    @Param('id') id: string,
    @CurrentUser('id') userId: string
  ) {
    return this.workspacesService.leaveWorkspace(id, userId);
  }

  @Get('invitations/:token')
  @ApiOperation({ summary: 'Get workspace invitation details by token' })
  async getInvitation(@Param('token') token: string) {
    return this.workspacesService.getInvitation(token);
  }

  @Post('invitations/:token/accept')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Accept workspace invitation (Authenticated)' })
  async acceptInvitation(
    @Param('token') token: string,
    @CurrentUser('id') userId: string
  ) {
    return this.workspacesService.acceptInvitation(token, userId);
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
