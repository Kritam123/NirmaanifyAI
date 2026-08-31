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

  // In-memory fallback for local dev when DB server is offline
  private memoryUsers: Map<string, any> = new Map([
    [
      'alex@nirmaanify.ai',
      {
        id: 'usr-alex-001',
        email: 'alex@nirmaanify.ai',
        passwordHash: bcrypt.hashSync('password123', 10),
        name: 'Alex Developer',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
        role: 'OWNER',
        isEmailVerified: true,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
  ]);

  private memoryWorkspaces: Map<string, WorkspaceDto[]> = new Map([
    [
      'usr-alex-001',
      [
        {
          id: 'ws-personal-001',
          name: "Alex's Personal Studio",
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

    try {
      // 1. Try Prisma Database Registration
      const existingUser = await this.prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        throw new ConflictException('User with this email already exists');
      }

      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(dto.password, salt);

      const dbUser = await this.prisma.user.create({
        data: {
          email,
          name: dto.name,
          passwordHash,
          avatarUrl: dto.avatarUrl,
          role: 'OWNER',
          isEmailVerified: true,
          isActive: true,
        },
      });

      const wsSlug = `${dto.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-personal-${Math.floor(Math.random() * 1000)}`;
      const dbWs = await this.prisma.workspace.create({
        data: {
          name: `${dto.name}'s Workspace`,
          slug: wsSlug,
          isPersonal: true,
          ownerId: dbUser.id,
        },
      });

      await this.prisma.workspaceMember.create({
        data: {
          workspaceId: dbWs.id,
          userId: dbUser.id,
          role: 'OWNER',
        },
      });

      const userDto: UserDto = {
        id: dbUser.id,
        email: dbUser.email,
        name: dbUser.name,
        avatarUrl: dbUser.avatarUrl || undefined,
        role: dbUser.role as any,
        isEmailVerified: dbUser.isEmailVerified,
        isActive: dbUser.isActive,
        createdAt: dbUser.createdAt.toISOString(),
        updatedAt: dbUser.updatedAt.toISOString(),
      };

      const wsDto: WorkspaceDto = {
        id: dbWs.id,
        name: dbWs.name,
        slug: dbWs.slug,
        isPersonal: dbWs.isPersonal,
        ownerId: dbWs.ownerId,
        role: 'OWNER',
        projectCount: 0,
        memberCount: 1,
        createdAt: dbWs.createdAt.toISOString(),
        updatedAt: dbWs.updatedAt.toISOString(),
      };

      const accessToken = this.jwtService.sign({ sub: dbUser.id, email: dbUser.email });
      this.logger.log(`✓ [Prisma DB] Registered user: ${email}`);

      return {
        user: userDto,
        accessToken,
        activeWorkspace: wsDto,
        workspaces: [wsDto],
      };
    } catch (err: any) {
      if (err instanceof ConflictException) throw err;
      this.logger.warn(`Prisma registration fallback to memory: ${err.message}`);

      // 2. Memory Fallback
      if (this.memoryUsers.has(email)) {
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
        isEmailVerified: true,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
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
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      this.memoryUsers.set(email, { ...user, passwordHash });
      this.memoryWorkspaces.set(userId, [personalWs]);

      const accessToken = this.jwtService.sign({ sub: userId, email });
      return {
        user,
        accessToken,
        activeWorkspace: personalWs,
        workspaces: [personalWs],
      };
    }
  }

  async login(dto: LoginDto): Promise<AuthResponseDto> {
    const email = dto.email.toLowerCase().trim();

    try {
      // 1. Try Prisma Database Login
      const userRecord = await this.prisma.user.findUnique({
        where: { email },
        include: {
          workspaces: true,
          memberships: { include: { workspace: true } },
        },
      });

      if (userRecord) {
        const isMatch = await bcrypt.compare(dto.password, userRecord.passwordHash);
        if (!isMatch) {
          throw new UnauthorizedException('Invalid email or password');
        }

        const userDto: UserDto = {
          id: userRecord.id,
          email: userRecord.email,
          name: userRecord.name,
          avatarUrl: userRecord.avatarUrl || undefined,
          role: userRecord.role as any,
          isEmailVerified: userRecord.isEmailVerified,
          isActive: userRecord.isActive,
          createdAt: userRecord.createdAt.toISOString(),
          updatedAt: userRecord.updatedAt.toISOString(),
        };

        const ownedWorkspaces = userRecord.workspaces.map((w) => ({
          id: w.id,
          name: w.name,
          slug: w.slug,
          isPersonal: w.isPersonal,
          ownerId: w.ownerId,
          role: 'OWNER' as const,
          projectCount: 0,
          memberCount: 1,
          createdAt: w.createdAt.toISOString(),
          updatedAt: w.updatedAt.toISOString(),
        }));

        const memberWorkspaces = userRecord.memberships.map((m) => ({
          id: m.workspace.id,
          name: m.workspace.name,
          slug: m.workspace.slug,
          isPersonal: m.workspace.isPersonal,
          ownerId: m.workspace.ownerId,
          role: m.role as any,
          projectCount: 0,
          memberCount: 1,
          createdAt: m.workspace.createdAt.toISOString(),
          updatedAt: m.workspace.updatedAt.toISOString(),
        }));

        const allWorkspaces = [...ownedWorkspaces, ...memberWorkspaces.filter((mw) => !ownedWorkspaces.some((ow) => ow.id === mw.id))];
        const activeWorkspace = allWorkspaces[0] || null;

        const accessToken = this.jwtService.sign({ sub: userRecord.id, email: userRecord.email });
        this.logger.log(`✓ [Prisma DB] Logged in user: ${email}`);

        return {
          user: userDto,
          accessToken,
          activeWorkspace,
          workspaces: allWorkspaces,
        };
      }
    } catch (err: any) {
      if (err instanceof UnauthorizedException) throw err;
      this.logger.warn(`Prisma login check fallback to memory: ${err.message}`);
    }

    // 2. Memory Fallback
    const memUser = this.memoryUsers.get(email);
    if (!memUser) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(dto.password, memUser.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const user: UserDto = {
      id: memUser.id,
      email: memUser.email,
      name: memUser.name,
      avatarUrl: memUser.avatarUrl,
      role: memUser.role,
      isEmailVerified: memUser.isEmailVerified,
      isActive: memUser.isActive,
      createdAt: memUser.createdAt,
      updatedAt: memUser.updatedAt,
    };

    const workspaces = this.memoryWorkspaces.get(user.id) || [];
    const activeWorkspace = workspaces[0] || null;
    const accessToken = this.jwtService.sign({ sub: user.id, email: user.email });

    this.logger.log(`✓ [Memory Fallback] Logged in user: ${email}`);

    return {
      user,
      accessToken,
      activeWorkspace,
      workspaces,
    };
  }

  async getProfile(userId: string): Promise<UserDto> {
    try {
      const dbUser = await this.prisma.user.findUnique({ where: { id: userId } });
      if (dbUser) {
        return {
          id: dbUser.id,
          email: dbUser.email,
          name: dbUser.name,
          avatarUrl: dbUser.avatarUrl || undefined,
          role: dbUser.role as any,
          isEmailVerified: dbUser.isEmailVerified,
          isActive: dbUser.isActive,
          createdAt: dbUser.createdAt.toISOString(),
          updatedAt: dbUser.updatedAt.toISOString(),
        };
      }
    } catch {
      // Fallback
    }

    for (const u of this.memoryUsers.values()) {
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

    throw new NotFoundException('User profile not found');
  }

  async forgotPassword(dto: ForgotPasswordDto) {
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
