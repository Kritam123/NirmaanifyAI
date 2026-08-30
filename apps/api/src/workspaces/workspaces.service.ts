import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { WorkspaceDto, WorkspaceMemberDto } from '@nirmaanify/types';
import { CreateWorkspaceDto, InviteMemberDto } from './dto/workspace.dto';

@Injectable()
export class WorkspacesService {
  private readonly logger = new Logger(WorkspacesService.name);

  private workspaces: WorkspaceDto[] = [
    {
      id: 'ws-personal-001',
      name: "Alex's Workspace",
      slug: 'alex-personal',
      isPersonal: true,
      ownerId: 'usr-alex-001',
      role: 'OWNER',
      projectCount: 3,
      memberCount: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'ws-team-002',
      name: 'Acme SaaS Corp',
      slug: 'acme-saas',
      isPersonal: false,
      ownerId: 'usr-alex-001',
      role: 'OWNER',
      projectCount: 6,
      memberCount: 5,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  private members: Map<string, WorkspaceMemberDto[]> = new Map([
    [
      'ws-team-002',
      [
        {
          id: 'mem-1',
          workspaceId: 'ws-team-002',
          userId: 'usr-alex-001',
          role: 'OWNER',
          user: { id: 'usr-alex-001', name: 'Alex Developer', email: 'alex@nirmaanify.ai' },
          createdAt: new Date().toISOString(),
        },
        {
          id: 'mem-2',
          workspaceId: 'ws-team-002',
          userId: 'usr-sarah-002',
          role: 'DEVELOPER',
          user: { id: 'usr-sarah-002', name: 'Sarah Chen', email: 'sarah@acme.com' },
          createdAt: new Date().toISOString(),
        },
        {
          id: 'mem-3',
          workspaceId: 'ws-team-002',
          userId: 'usr-david-003',
          role: 'EDITOR',
          user: { id: 'usr-david-003', name: 'David Miller', email: 'david@acme.com' },
          createdAt: new Date().toISOString(),
        },
      ],
    ],
  ]);

  async listWorkspaces(): Promise<WorkspaceDto[]> {
    return this.workspaces;
  }

  async getWorkspaceById(id: string): Promise<WorkspaceDto> {
    const ws = this.workspaces.find((w) => w.id === id);
    if (!ws) throw new NotFoundException(`Workspace ${id} not found`);
    return {
      ...ws,
      members: this.members.get(id) || [],
    };
  }

  async createWorkspace(dto: CreateWorkspaceDto, ownerId: string): Promise<WorkspaceDto> {
    const slug = dto.slug || dto.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const newWs: WorkspaceDto = {
      id: `ws-${Date.now()}`,
      name: dto.name,
      slug,
      isPersonal: Boolean(dto.isPersonal),
      ownerId,
      role: 'OWNER',
      projectCount: 0,
      memberCount: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.workspaces.push(newWs);
    this.logger.log(`✓ Workspace created: ${newWs.name} (${newWs.id})`);
    return newWs;
  }

  async listMembers(workspaceId: string): Promise<WorkspaceMemberDto[]> {
    return this.members.get(workspaceId) || [];
  }

  async inviteMember(workspaceId: string, dto: InviteMemberDto): Promise<any> {
    const token = `inv-${Date.now()}`;
    const newMember: WorkspaceMemberDto = {
      id: `mem-${Date.now()}`,
      workspaceId,
      userId: `usr-${Date.now()}`,
      role: dto.role,
      user: {
        id: `usr-${Date.now()}`,
        name: dto.email.split('@')[0],
        email: dto.email,
      },
      createdAt: new Date().toISOString(),
    };

    const current = this.members.get(workspaceId) || [];
    current.push(newMember);
    this.members.set(workspaceId, current);

    this.logger.log(`✓ Team member invited: ${dto.email} as [${dto.role}] to workspace ${workspaceId}`);

    return {
      message: `Invitation sent to ${dto.email}`,
      token,
      member: newMember,
    };
  }

  async removeMember(workspaceId: string, userId: string): Promise<boolean> {
    const current = this.members.get(workspaceId) || [];
    const filtered = current.filter((m) => m.userId !== userId);
    this.members.set(workspaceId, filtered);
    return true;
  }
}
