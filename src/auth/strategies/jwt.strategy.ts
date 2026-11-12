import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { Strategy } from 'passport-jwt';
import { AuthService } from '../auth.service.js';
import { AUTH_SCHEME_BEARER, AUTH_SCHEME_TOKEN } from '../constants/auth.constants.js';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      jwtFromRequest: JwtStrategy.extractTokenFromHeader,
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'secret_key_dev',
      passReqToCallback: true,
    });
  }

  private static extractTokenFromHeader(request: Request): string | null {
    const authHeader = request.headers?.authorization;
    if (!authHeader) {
      return null;
    }
    const [scheme, token] = authHeader.split(' ');
    if (scheme === AUTH_SCHEME_TOKEN || scheme === AUTH_SCHEME_BEARER) {
      return token ?? null;
    }
    return null;
  }

  async validate(req: Request, payload: { sub: number; email: string }) {
    const token = JwtStrategy.extractTokenFromHeader(req);
    if (!token) {
      throw new UnauthorizedException('Token missing');
    }

    const isBlacklisted = await this.authService.isTokenBlacklisted(token);
    if (isBlacklisted) {
      throw new UnauthorizedException('Token has been revoked');
    }

    return { id: payload.sub, email: payload.email };
  }
}