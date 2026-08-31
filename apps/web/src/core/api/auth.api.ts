import { apiClient } from './client';
import { ENDPOINTS } from './endpoints';
import { AuthResponseDto, UserDto, WorkspaceDto } from '@nirmaanify/types';

export interface LoginPayload {
  email: string;
  password?: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password?: string;
  avatarUrl?: string;
}

export const authApi = {
  async login(payload: LoginPayload): Promise<AuthResponseDto> {
    return apiClient.post<AuthResponseDto>(ENDPOINTS.AUTH.LOGIN, {
      email: payload.email,
      password: payload.password || 'password123',
    }, { skipAuth: true });
  },

  async register(payload: RegisterPayload): Promise<AuthResponseDto> {
    return apiClient.post<AuthResponseDto>(ENDPOINTS.AUTH.REGISTER, {
      name: payload.name,
      email: payload.email,
      password: payload.password || 'password123',
      avatarUrl: payload.avatarUrl,
    }, { skipAuth: true });
  },

  async getProfile(): Promise<UserDto> {
    return apiClient.get<UserDto>(ENDPOINTS.AUTH.PROFILE);
  },

  async forgotPassword(email: string): Promise<{ message: string; mockResetToken?: string }> {
    return apiClient.post(ENDPOINTS.AUTH.FORGOT_PASSWORD, { email }, { skipAuth: true });
  },

  async resetPassword(password: string, token: string): Promise<{ message: string }> {
    return apiClient.post(ENDPOINTS.AUTH.RESET_PASSWORD, { password, token }, { skipAuth: true });
  },
};
