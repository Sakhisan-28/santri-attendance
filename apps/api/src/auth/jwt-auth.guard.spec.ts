import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { describe, expect, it } from 'vitest';
import { JwtAuthGuard } from './jwt-auth.guard.js';
import { signJwt } from './jwt.utils.js';

const SECRET = 'test-secret-min-32-chars-0123456789';

interface FakeRequest {
  headers: Record<string, string | undefined>;
  user?: unknown;
}

function contextWithHeaders(headers: Record<string, string | undefined>) {
  const request: FakeRequest = { headers };
  return {
    context: {
      switchToHttp: () => ({ getRequest: () => request }),
    } as unknown as ExecutionContext,
    request,
  };
}

describe('JwtAuthGuard', () => {
  it('token valid diterima dan user identity diambil dari token', () => {
    process.env.JWT_SECRET = SECRET;
    const guard = new JwtAuthGuard();
    const token = signJwt({ sub: '1', username: 'admin' }, SECRET, 900);
    const context = contextWithHeaders({ authorization: `Bearer ${token}` });

    expect(guard.canActivate(context.context)).toBe(true);
    expect(context.request.user).toEqual({ id: '1', username: 'admin' });
  });

  it('tanpa header Authorization ditolak', () => {
    process.env.JWT_SECRET = SECRET;
    const guard = new JwtAuthGuard();
    const context = contextWithHeaders({});

    expect(() => guard.canActivate(context.context)).toThrow(UnauthorizedException);
  });

  it('token invalid atau salah secret ditolak', () => {
    process.env.JWT_SECRET = SECRET;
    const guard = new JwtAuthGuard();
    const forged = signJwt({ sub: '1', username: 'admin' }, 'secret-lain-0123456789abcdef', 900);
    const context = contextWithHeaders({ authorization: `Bearer ${forged}` });

    expect(() => guard.canActivate(context.context)).toThrow(UnauthorizedException);
  });

  it('skema selain Bearer ditolak', () => {
    process.env.JWT_SECRET = SECRET;
    const guard = new JwtAuthGuard();
    const context = contextWithHeaders({ authorization: 'Basic abcdef' });

    expect(() => guard.canActivate(context.context)).toThrow(UnauthorizedException);
  });
});
