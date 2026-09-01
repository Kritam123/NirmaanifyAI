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
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Workspaces')
@ApiBearerAuth()
@Controller('workspaces')
export class WorkspacesController {
  constructor(private readonly workspacesService: WorkspacesService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'List all workspaces for authenticated user' })
  async listWorkspaces() {
    return this.workspacesService.listWorkspaces();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get workspace details and members' })
  async getWorkspace(@Param('id') id: string) {
    return this.workspacesService.getWorkspaceById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('OWNER', 'ADMIN', 'DEVELOPER')
  @ApiOperation({ summary: 'Create a new workspace' })
  async createWorkspace(
    @Body() dto: CreateWorkspaceDto,
    @CurrentUser('id') userId?: string
  ) {
    return this.workspacesService.createWorkspace(dto, userId || 'usr-alex-001');
  }

  @Get(':id/members')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'List members of a workspace' })
  async listMembers(@Param('id') id: string) {
    return this.workspacesService.listMembers(id);
  }

  @Post(':id/invites')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('OWNER', 'ADMIN')
  @ApiOperation({ summary: 'Invite a member to a workspace (Owner/Admin only)' })
  async inviteMember(
    @Param('id') id: string,
    @Body() dto: InviteMemberDto
  ) {
    return this.workspacesService.inviteMember(id, dto);
  }

  @Delete(':id/members/:userId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('OWNER', 'ADMIN')
  @ApiOperation({ summary: 'Remove a member from a workspace (Owner/Admin only)' })
  async removeMember(
    @Param('id') id: string,
    @Param('userId') userId: string
  ) {
    return this.workspacesService.removeMember(id, userId);
  }
}
