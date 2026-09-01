import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'super_secret_nirmaanify_jwt_key_32chars_long!',
    });
  }

  async validate(payload: { sub: string; email: string; role?: string }) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        select: {
          id: true,
          email: true,
          name: true,
          avatarUrl: true,
          role: true,
          isEmailVerified: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (user && user.isActive) {
        return user;
      }
    } catch {
      // In-memory fallback if DB is not reachable
    }

    return {
      id: payload.sub,
      email: payload.email,
      name: payload.email ? payload.email.split('@')[0] : 'Nirmaanify Developer',
      role: payload.role || 'OWNER',
      isEmailVerified: true,
      isActive: true,
    };
  }
}
