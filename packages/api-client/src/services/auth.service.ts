import { HttpClient } from '../http-client';
import { API_ENDPOINTS } from '../endpoints';
import {
  RegisterDto,
  LoginDto,
  OAuthLoginDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  VerifyEmailDto,
  AuthResponseDto,
  UserDto,
} from '@nirmaanify/types';

export class AuthService {
  constructor(private readonly http: HttpClient) {}

  /**
   * Register new user and initialize personal workspace
   */
  async register(dto: RegisterDto): Promise<AuthResponseDto> {
    
    return this.http.post<AuthResponseDto>(API_ENDPOINTS.AUTH.REGISTER, dto);
  }

  /**
   * Authenticate user with email and password
   */
  async login(dto: LoginDto): Promise<AuthResponseDto> {
    return this.http.post<AuthResponseDto>(API_ENDPOINTS.AUTH.LOGIN, dto);
  }

  /**
   * Authenticate or link user via OAuth provider (Google, GitHub)
   */
  async oauthLogin(dto: OAuthLoginDto): Promise<AuthResponseDto> {
    return this.http.post<AuthResponseDto>(API_ENDPOINTS.AUTH.OAUTH, dto);
  }

  /**
   * Get current authenticated user profile
   */
  async getProfile(): Promise<UserDto> {
    return this.http.get<UserDto>(API_ENDPOINTS.AUTH.ME);
  }

  /**
   * Request a password reset link for the provided email
   */
  async forgotPassword(dto: ForgotPasswordDto): Promise<{ success?: boolean; delivered?: boolean; message: string }> {
    return this.http.post<{ success?: boolean; delivered?: boolean; message: string }>(
      API_ENDPOINTS.AUTH.FORGOT_PASSWORD,
      dto
    );
  }

  /**
   * Resend password reset email
   */
  async resendPasswordReset(email: string): Promise<{ success?: boolean; delivered?: boolean; message: string }> {
    return this.http.post<{ success?: boolean; delivered?: boolean; message: string }>(
      API_ENDPOINTS.AUTH.RESEND_PASSWORD_RESET,
      { email }
    );
  }

  /**
   * Reset user password using verified reset token
   */
  async resetPassword(dto: ResetPasswordDto): Promise<{ message: string }> {
    return this.http.post<{ message: string }>(API_ENDPOINTS.AUTH.RESET_PASSWORD, dto);
  }

  /**
   * Verify email address with confirmation token or 6-digit OTP code
   */
  async verifyEmail(dto: VerifyEmailDto): Promise<{ success: boolean; message: string; user?: UserDto; accessToken?: string }> {
    return this.http.post<{ success: boolean; message: string; user?: UserDto; accessToken?: string }>(
      API_ENDPOINTS.AUTH.VERIFY_EMAIL,
      dto
    );
  }

  /**
   * Resend a fresh email verification code and link
   */
  async resendVerification(email: string): Promise<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(
      API_ENDPOINTS.AUTH.RESEND_VERIFICATION,
      { email }
    );
  }
}
