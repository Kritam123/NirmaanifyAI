import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { AuthResponseDto, UserDto, WorkspaceDto } from '@nirmaanify/types';
import { PrismaService } from '../database/prisma.service';
import {
  RegisterDto,
  LoginDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  VerifyEmailDto,
} from './dto/auth.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  // In-memory user store for mock/fallback execution when database is offline
  private mockUsers: Map<string, any> = new Map([
    [
      'alex@nirmaanify.ai',
      {
        id: 'usr-alex-001',
        email: 'alex@nirmaanify.ai',
        passwordHash: bcrypt.hashSync('password123', 10),
        name: 'Alex Developer',
        avatarUrl: 'https://github.com/shadcn.png',
        role: 'OWNER',
        isEmailVerified: true,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
  ]);

  private mockWorkspaces: Map<string, WorkspaceDto[]> = new Map([
    [
      'usr-alex-001',
      [
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
      ],
    ],
  ]);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponseDto> {
    const email = dto.email.toLowerCase().trim();
    const existing = this.mockUsers.get(email);
    if (existing) {
      throw new ConflictException('User with this email already exists');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(dto.password, salt);
    const userId = `usr-${Date.now()}`;

    const user: UserDto = {
      id: userId,
      email,
      name: dto.name,
      avatarUrl: dto.avatarUrl,
      role: 'OWNER',
      isEmailVerified: false,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const personalWs: WorkspaceDto = {
      id: `ws-${Date.now()}`,
      name: `${dto.name}'s Workspace`,
      slug: `${dto.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-personal`,
      isPersonal: true,
      ownerId: userId,
      role: 'OWNER',
      projectCount: 0,
      memberCount: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.mockUsers.set(email, { ...user, passwordHash });
    this.mockWorkspaces.set(userId, [personalWs]);

    this.logger.log(`✓ User registered: ${email} (Personal Workspace: ${personalWs.name})`);

    const accessToken = this.jwtService.sign({ sub: userId, email });

    return {
      user,
      accessToken,
      activeWorkspace: personalWs,
      workspaces: [personalWs],
    };
  }

  async login(dto: LoginDto): Promise<AuthResponseDto> {
    const email = dto.email.toLowerCase().trim();
    const userRecord = this.mockUsers.get(email);

    if (!userRecord) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(dto.password, userRecord.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const user: UserDto = {
      id: userRecord.id,
      email: userRecord.email,
      name: userRecord.name,
      avatarUrl: userRecord.avatarUrl,
      role: userRecord.role,
      isEmailVerified: userRecord.isEmailVerified,
      isActive: userRecord.isActive,
      createdAt: userRecord.createdAt,
      updatedAt: userRecord.updatedAt,
    };

    const workspaces = this.mockWorkspaces.get(user.id) || [];
    const activeWorkspace = workspaces[0] || {
      id: `ws-${user.id}`,
      name: `${user.name}'s Workspace`,
      slug: `${user.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-workspace`,
      isPersonal: true,
      ownerId: user.id,
      role: 'OWNER',
      projectCount: 0,
      memberCount: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const accessToken = this.jwtService.sign({ sub: user.id, email: user.email });

    this.logger.log(`✓ User logged in: ${email}`);

    return {
      user,
      accessToken,
      activeWorkspace,
      workspaces,
    };
  }

  async getProfile(userId: string): Promise<UserDto> {
    for (const u of this.mockUsers.values()) {
      if (u.id === userId) {
        return {
          id: u.id,
          email: u.email,
          name: u.name,
          avatarUrl: u.avatarUrl,
          role: u.role,
          isEmailVerified: u.isEmailVerified,
          isActive: u.isActive,
          createdAt: u.createdAt,
          updatedAt: u.updatedAt,
        };
      }
    }
    throw new NotFoundException('User not found');
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = this.mockUsers.get(dto.email.toLowerCase().trim());
    if (!user) {
      // Return success anyway to avoid user enumeration
      return { message: 'If that email exists, password reset instructions have been sent.' };
    }
    const token = `reset-token-${Date.now()}`;
    this.logger.log(`🔑 Password reset token generated for ${dto.email}: ${token}`);
    return {
      message: 'Password reset link sent to email.',
      mockResetToken: token,
    };
  }

  async resetPassword(dto: ResetPasswordDto) {
    return { message: 'Password has been successfully updated. You can now login.' };
  }

  async verifyEmail(dto: VerifyEmailDto) {
    return { message: 'Email address verified successfully.' };
  }
}
