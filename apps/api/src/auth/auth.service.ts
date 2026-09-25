import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { AuthResponseDto, UserDto, WorkspaceDto } from '@nirmaanify/types';
import { PrismaService } from '../database/prisma.service';
import { MailService } from '../mail/mail.service';
import {
  RegisterDto,
  LoginDto,
  OAuthLoginDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  VerifyEmailDto,
  ResendVerificationDto,
} from './dto/auth.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService
  ) {}

  /**
   * Register new user, generate verification token & OTP, send verification email
   */
  async register(dto: RegisterDto): Promise<AuthResponseDto> {
    const email = dto.email.toLowerCase().trim();

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(dto.password, salt);

    // 1. Create user in PostgreSQL with isEmailVerified: false
    const createdUser = await this.prisma.user.create({
      data: {
        email,
        name: dto.name,
        passwordHash,
        avatarUrl: dto.avatarUrl,
        role: 'OWNER',
        primaryProvider: 'CREDENTIALS',
        isEmailVerified: false,
        isActive: true,
      },
      include: {
        workspaces: true,
        socialAccounts: true,
      },
    });

    this.logger.log(`✓ User registered in PostgreSQL: ${email} (${createdUser.id})`);

    // 2. Generate secure verification token and 6-digit OTP code
    const token = crypto.randomUUID();
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 24 * 3600 * 1000); // 24 hours

    await this.prisma.emailVerificationToken.create({
      data: {
        userId: createdUser.id,
        email,
        token,
        otp,
        expiresAt,
      },
    });

    // 3. Dispatch real verification email using Nodemailer / Gmail SMTP
    const emailResult = await this.mailService.sendEmailVerification({
      to: email,
      name: dto.name,
      token,
      otp,
      expiresAt,
    });

    if (emailResult.delivered) {
      this.logger.log(`✉️ Real verification email delivered to ${email}`);
    } else {
      this.logger.warn(`⚠️ Verification email delivery warning for ${email}: ${emailResult.message}`);
    }

    const accessToken = this.jwtService.sign({
      sub: createdUser.id,
      email: createdUser.email,
      role: createdUser.role,
    });

    const userDto: UserDto = {
      id: createdUser.id,
      email: createdUser.email,
      name: createdUser.name,
      avatarUrl: createdUser.avatarUrl || undefined,
      role: createdUser.role as any,
      primaryProvider: createdUser.primaryProvider as any,
      isEmailVerified: false,
      isActive: createdUser.isActive,
      createdAt: createdUser.createdAt,
      updatedAt: createdUser.updatedAt,
    };

    return {
      user: userDto,
      accessToken,
      activeWorkspace: null,
      workspaces: [],
    };
  }

  /**
   * Authenticate user against PostgreSQL database credentials
   */
  async login(dto: LoginDto): Promise<AuthResponseDto> {
    const email = dto.email.toLowerCase().trim();

    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        workspaces: true,
        socialAccounts: true,
      },
    });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is inactive or disabled');
    }

    // Fetch user's workspaces
    const workspaces = await this.prisma.workspace.findMany({
      where: {
        OR: [
          { ownerId: user.id },
          { members: { some: { userId: user.id } } },
        ],
      },
      include: {
        projects: true,
        members: true,
      },
    });

    const userDto: UserDto = {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl || undefined,
      role: user.role as any,
      primaryProvider: user.primaryProvider as any,
      socialAccounts: user.socialAccounts as any,
      isEmailVerified: user.isEmailVerified,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    const wsDtos: WorkspaceDto[] = workspaces.map((w) => ({
      id: w.id,
      name: w.name,
      slug: w.slug,
      isPersonal: w.isPersonal,
      ownerId: w.ownerId,
      role: w.ownerId === user.id ? 'OWNER' : 'DEVELOPER',
      projectCount: w.projects?.length || 0,
      memberCount: w.members?.length || 1,
      createdAt: w.createdAt,
      updatedAt: w.updatedAt,
    }));

    const activeWorkspace = wsDtos[0] || null;

    const accessToken = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    this.logger.log(`✓ User authenticated from PostgreSQL: ${email} (${user.id})`);

    return {
      user: userDto,
      accessToken,
      activeWorkspace,
      workspaces: wsDtos,
    };
  }

  /**
   * Authenticate or register OAuth user and persist in PostgreSQL
   */
  async oauthLogin(dto: OAuthLoginDto): Promise<AuthResponseDto> {
    const email = dto.email.toLowerCase().trim();
    const providerEnum = dto.provider.toUpperCase() as 'GOOGLE' | 'GITHUB';

    let user = await this.prisma.user.findUnique({
      where: { email },
      include: { socialAccounts: true, workspaces: true },
    });

    if (user) {
      // Upsert linked social account
      await this.prisma.socialAccount.upsert({
        where: {
          provider_providerAccountId: {
            provider: providerEnum,
            providerAccountId: dto.providerAccountId,
          },
        },
        update: {
          displayName: dto.name || user.name,
          avatarUrl: dto.avatarUrl || user.avatarUrl,
          accessToken: dto.accessToken,
          refreshToken: dto.refreshToken,
          expiresAt: dto.expiresAt,
          idToken: dto.idToken,
          profileData: dto.profileData || {},
          lastLoginAt: new Date(),
        },
        create: {
          userId: user.id,
          provider: providerEnum,
          providerAccountId: dto.providerAccountId,
          email: dto.email,
          displayName: dto.name || user.name,
          avatarUrl: dto.avatarUrl || user.avatarUrl,
          accessToken: dto.accessToken,
          refreshToken: dto.refreshToken,
          expiresAt: dto.expiresAt,
          idToken: dto.idToken,
          profileData: dto.profileData || {},
          lastLoginAt: new Date(),
        },
      });

      this.logger.log(`✓ Linked ${dto.provider} OAuth account to user in DB: ${email}`);
    } else {
      // Create new user via OAuth without automatic workspace creation
      user = await this.prisma.user.create({
        data: {
          email,
          name: dto.name || email.split('@')[0],
          avatarUrl: dto.avatarUrl,
          role: 'OWNER',
          primaryProvider: providerEnum,
          isEmailVerified: true,
          isActive: true,
          socialAccounts: {
            create: {
              provider: providerEnum,
              providerAccountId: dto.providerAccountId,
              email: dto.email,
              displayName: dto.name,
              avatarUrl: dto.avatarUrl,
              accessToken: dto.accessToken,
              refreshToken: dto.refreshToken,
              expiresAt: dto.expiresAt,
              idToken: dto.idToken,
              profileData: dto.profileData || {},
            },
          },
        },
        include: {
          workspaces: true,
          socialAccounts: true,
        },
      });

      this.logger.log(`✓ Registered new user via ${dto.provider} OAuth in DB: ${email}`);
    }

    const workspaces = await this.prisma.workspace.findMany({
      where: {
        OR: [
          { ownerId: user.id },
          { members: { some: { userId: user.id } } },
        ],
      },
      include: {
        projects: true,
        members: true,
      },
    });

    const userDto: UserDto = {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl || undefined,
      role: user.role as any,
      primaryProvider: user.primaryProvider as any,
      socialAccounts: user.socialAccounts as any,
      isEmailVerified: user.isEmailVerified,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    const wsDtos: WorkspaceDto[] = workspaces.map((w) => ({
      id: w.id,
      name: w.name,
      slug: w.slug,
      isPersonal: w.isPersonal,
      ownerId: w.ownerId,
      role: w.ownerId === user.id ? 'OWNER' : 'DEVELOPER',
      projectCount: w.projects?.length || 0,
      memberCount: w.members?.length || 1,
      createdAt: w.createdAt,
      updatedAt: w.updatedAt,
    }));

    const activeWorkspace = wsDtos[0] || {
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

    const accessToken = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      user: userDto,
      accessToken,
      activeWorkspace,
      workspaces: wsDtos.length ? wsDtos : [activeWorkspace],
    };
  }

  /**
   * Get authenticated user profile from PostgreSQL
   */
  async getProfile(userId?: string, email?: string): Promise<UserDto> {
    if (!userId && !email) {
      throw new NotFoundException('User identification missing');
    }

    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          ...(userId ? [{ id: userId }] : []),
          ...(email ? [{ email }] : []),
        ],
      },
      include: {
        socialAccounts: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl || undefined,
      role: user.role as any,
      primaryProvider: user.primaryProvider as any,
      socialAccounts: user.socialAccounts as any,
      isEmailVerified: user.isEmailVerified,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  /**
   * Create password reset token in database and dispatch real recovery email
   */
  async forgotPassword(dto: ForgotPasswordDto) {
    const email = dto.email.toLowerCase().trim();
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (user) {
      // Invalidate existing unused reset tokens for this user
      await this.prisma.passwordResetToken.updateMany({
        where: {
          userId: user.id,
          isUsed: false,
        },
        data: {
          isUsed: true,
        },
      });

      const token = crypto.randomUUID();
      const expiresAt = new Date(Date.now() + 3600000); // 1 hour expiration
      await this.prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          token,
          expiresAt,
        },
      });

      // Dispatch real email with reset link via Nodemailer / Gmail SMTP
      const emailResult = await this.mailService.sendPasswordReset({
        to: email,
        name: user.name,
        token,
        expiresAt,
      });

      this.logger.log(
        `🔑 Real password reset email sent to ${email} (Delivered: ${emailResult.delivered})`
      );

      return {
        success: true,
        delivered: emailResult.delivered,
        message: emailResult.delivered
          ? 'Password reset instructions have been sent to your registered email address.'
          : emailResult.message,
      };
    }

    return {
      success: true,
      delivered: true,
      message: 'If an account exists with this email address, password reset instructions have been sent.',
    };
  }

  /**
   * Verify token and update user password in database
   */
  async resetPassword(dto: ResetPasswordDto) {
    const resetRecord = await this.prisma.passwordResetToken.findUnique({
      where: { token: dto.token },
    });

    if (!resetRecord || resetRecord.isUsed || resetRecord.expiresAt < new Date()) {
      throw new BadRequestException('Password reset token is invalid or has expired');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(dto.newPassword, salt);

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: resetRecord.userId },
        data: { passwordHash },
      }),
      this.prisma.passwordResetToken.update({
        where: { id: resetRecord.id },
        data: { isUsed: true },
      }),
    ]);

    this.logger.log(`✓ Password updated in DB for user ${resetRecord.userId}`);

    return { message: 'Password has been successfully updated. You can now login.' };
  }

  /**
   * Verify user email address in database using token or OTP
   */
  async verifyEmail(dto: VerifyEmailDto) {
    const rawToken = dto.token?.trim();
    const rawOtp = dto.otp?.trim();
    const rawEmail = dto.email?.toLowerCase().trim();

    if (!rawToken && !rawOtp) {
      throw new BadRequestException('Please provide a verification token or 6-digit OTP code');
    }

    let verificationRecord: any = null;

    if (rawToken) {
      verificationRecord = await this.prisma.emailVerificationToken.findUnique({
        where: { token: rawToken },
        include: { user: true },
      });
    } else if (rawOtp && rawEmail) {
      verificationRecord = await this.prisma.emailVerificationToken.findFirst({
        where: {
          email: { equals: rawEmail, mode: 'insensitive' },
          otp: rawOtp,
          isUsed: false,
        },
        include: { user: true },
        orderBy: { createdAt: 'desc' },
      });
    } else if (rawOtp) {
      verificationRecord = await this.prisma.emailVerificationToken.findFirst({
        where: {
          otp: rawOtp,
          isUsed: false,
        },
        include: { user: true },
        orderBy: { createdAt: 'desc' },
      });
    }

    if (!verificationRecord) {
      throw new BadRequestException('Invalid verification code or link.');
    }

    if (verificationRecord.isUsed) {
      throw new BadRequestException('This verification code has already been used. Please log in.');
    }

    if (new Date() > verificationRecord.expiresAt) {
      throw new BadRequestException('Verification code has expired. Please request a new one.');
    }

    // Atomically mark user as verified and token as used
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: verificationRecord.userId },
        data: { isEmailVerified: true },
      }),
      this.prisma.emailVerificationToken.update({
        where: { id: verificationRecord.id },
        data: { isUsed: true },
      }),
    ]);

    this.logger.log(`✓ Email verified for user: ${verificationRecord.email} (${verificationRecord.userId})`);

    const user = verificationRecord.user;
    const accessToken = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    const userDto: UserDto = {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl || undefined,
      role: user.role as any,
      primaryProvider: user.primaryProvider as any,
      isEmailVerified: true,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return {
      success: true,
      message: 'Email address verified successfully!',
      user: userDto,
      accessToken,
    };
  }

  /**
   * Resend a fresh verification email with OTP and token
   */
  async resendVerification(dto: ResendVerificationDto) {
    const email = dto.email.toLowerCase().trim();

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException('No account found with this email address.');
    }

    if (user.isEmailVerified) {
      return {
        success: true,
        message: 'Your email address is already verified. You can sign in directly.',
      };
    }

    // Invalidate previous unused tokens for this email
    await this.prisma.emailVerificationToken.updateMany({
      where: {
        email,
        isUsed: false,
      },
      data: {
        isUsed: true,
      },
    });

    // Generate new token & OTP
    const token = crypto.randomUUID();
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 24 * 3600 * 1000); // 24 hours

    await this.prisma.emailVerificationToken.create({
      data: {
        userId: user.id,
        email,
        token,
        otp,
        expiresAt,
      },
    });

    const emailResult = await this.mailService.sendEmailVerification({
      to: email,
      name: user.name,
      token,
      otp,
      expiresAt,
    });

    this.logger.log(`✉️ Resent verification email to: ${email} (Delivered: ${emailResult.delivered})`);

    return {
      success: true,
      delivered: emailResult.delivered,
      message: emailResult.delivered
        ? `A fresh verification code has been sent to ${email}.`
        : emailResult.message,
    };
  }
}
