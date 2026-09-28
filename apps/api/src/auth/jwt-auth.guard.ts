import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { verifyJwt } from './jwt.utils.js';

export interface AuthenticatedUser {
  id: string;
  username: string;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<{
      headers: Record<string, string | undefined>;
      user?: AuthenticatedUser;
    }>();
    const authorization = request.headers?.authorization;
    if (!authorization || !authorization.startsWith('Bearer ')) {
      throw new UnauthorizedException(
        'Akses ditolak: token tidak ditemukan',
      );
    }
    try {
      const payload = verifyJwt(authorization.slice('Bearer '.length).trim());
      request.user = { id: payload.sub, username: payload.username };
      return true;
    } catch {
      throw new UnauthorizedException(
        'Akses ditolak: token tidak valid atau kedaluwarsa',
      );
    }
  }
}
