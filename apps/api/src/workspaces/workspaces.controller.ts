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
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Workspaces')
@Controller('workspaces')
export class WorkspacesController {
  constructor(private readonly workspacesService: WorkspacesService) {}

  @Get()
  @ApiOperation({ summary: 'List all workspaces for authenticated user' })
  async listWorkspaces() {
    return this.workspacesService.listWorkspaces();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get workspace details and members' })
  async getWorkspace(@Param('id') id: string) {
    return this.workspacesService.getWorkspaceById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new workspace' })
  async createWorkspace(
    @Body() dto: CreateWorkspaceDto,
    @CurrentUser('id') userId?: string
  ) {
    return this.workspacesService.createWorkspace(dto, userId || 'usr-alex-001');
  }

  @Get(':id/members')
  @ApiOperation({ summary: 'List members of a workspace' })
  async listMembers(@Param('id') id: string) {
    return this.workspacesService.listMembers(id);
  }

  @Post(':id/invites')
  @ApiOperation({ summary: 'Invite a member to a workspace' })
  async inviteMember(
    @Param('id') id: string,
    @Body() dto: InviteMemberDto
  ) {
    return this.workspacesService.inviteMember(id, dto);
  }

  @Delete(':id/members/:userId')
  @ApiOperation({ summary: 'Remove a member from a workspace' })
  async removeMember(
    @Param('id') id: string,
    @Param('userId') userId: string
  ) {
    return this.workspacesService.removeMember(id, userId);
  }
}
