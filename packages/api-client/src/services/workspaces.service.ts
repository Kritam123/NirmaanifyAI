import { HttpClient } from '../http-client';
import { API_ENDPOINTS } from '../endpoints';
import {
  WorkspaceDto,
  CreateWorkspaceDto,
  WorkspaceMemberDto,
  InviteMemberDto,
} from '@nirmaanify/types';

export class WorkspacesService {
  constructor(private readonly http: HttpClient) {}

  /**
   * List all workspaces accessible by the user
   */
  async listWorkspaces(): Promise<WorkspaceDto[]> {
    return this.http.get<WorkspaceDto[]>(API_ENDPOINTS.WORKSPACES.LIST);
  }

  /**
   * Get workspace details by ID
   */
  async getWorkspace(id: string): Promise<WorkspaceDto> {
    return this.http.get<WorkspaceDto>(API_ENDPOINTS.WORKSPACES.DETAIL(id));
  }

  /**
   * Create a new workspace
   */
  async createWorkspace(dto: CreateWorkspaceDto): Promise<WorkspaceDto> {
    return this.http.post<WorkspaceDto>(API_ENDPOINTS.WORKSPACES.CREATE, dto);
  }

  /**
   * List members of a workspace
   */
  async listMembers(workspaceId: string): Promise<WorkspaceMemberDto[]> {
    return this.http.get<WorkspaceMemberDto[]>(API_ENDPOINTS.WORKSPACES.MEMBERS(workspaceId));
  }

  /**
   * Invite a new member to a workspace
   */
  async inviteMember(workspaceId: string, dto: InviteMemberDto): Promise<WorkspaceMemberDto> {
    return this.http.post<WorkspaceMemberDto>(API_ENDPOINTS.WORKSPACES.INVITE(workspaceId), dto);
  }

  /**
   * Update a member's role and permissions in a workspace
   */
  async updateMemberRole(
    workspaceId: string,
    userId: string,
    role: any
  ): Promise<{ success: boolean; message: string; member?: any }> {
    return this.http.patch<{ success: boolean; message: string; member?: any }>(
      API_ENDPOINTS.WORKSPACES.UPDATE_MEMBER_ROLE(workspaceId, userId),
      { role }
    );
  }

  /**
   * Remove a member from a workspace
   */
  async removeMember(workspaceId: string, userId: string): Promise<{ success: boolean; message?: string }> {
    return this.http.delete<{ success: boolean; message?: string }>(
      API_ENDPOINTS.WORKSPACES.REMOVE_MEMBER(workspaceId, userId)
    );
  }

  /**
   * Get public invitation details by token
   */
  async getInvitation(token: string): Promise<any> {
    return this.http.get<any>(API_ENDPOINTS.WORKSPACES.INVITATION_DETAILS(token));
  }

  /**
   * Accept workspace invitation
   */
  async acceptInvitation(token: string): Promise<{ success: boolean; message: string; workspaceId: string }> {
    return this.http.post<{ success: boolean; message: string; workspaceId: string }>(
      API_ENDPOINTS.WORKSPACES.ACCEPT_INVITATION(token)
    );
  }

  /**
   * Leave a workspace (Voluntary self-removal)
   */
  async leaveWorkspace(workspaceId: string): Promise<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(
      API_ENDPOINTS.WORKSPACES.LEAVE(workspaceId)
    );
  }

  /**
   * Delete workspace and cascade delete all associated projects
   */
  async deleteWorkspace(workspaceId: string): Promise<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(
      API_ENDPOINTS.WORKSPACES.DELETE(workspaceId)
    );
  }
}
