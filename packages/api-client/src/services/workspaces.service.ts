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
   * Remove a member from a workspace
   */
  async removeMember(workspaceId: string, userId: string): Promise<{ success: boolean; message?: string }> {
    return this.http.delete<{ success: boolean; message?: string }>(
      API_ENDPOINTS.WORKSPACES.REMOVE_MEMBER(workspaceId, userId)
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
