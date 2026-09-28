import { createHmac, timingSafeEqual } from 'node:crypto';

export interface JwtSignInput {
  sub: string;
  username: string;
}

export interface JwtPayload extends JwtSignInput {
  iat: number;
  exp: number;
}

/**
 * Ambil JWT secret dari environment. Jangan hardcode secret di source code.
 * Di production (NODE_ENV=production) JWT_SECRET wajib diisi.
 */
export function getJwtSecret(): string {
  if (process.env.JWT_SECRET) return process.env.JWT_SECRET;
  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'JWT_SECRET wajib diisi saat NODE_ENV=production. ' +
        'Set environment variable JWT_SECRET dengan nilai acak minimal 32 karakter.',
    );
  }
  return 'development-only-secret-change-me-min-32-chars';
}

/** Expire default 15 menit, bisa dioverride via JWT_EXPIRES_IN (mis. "15m", "7d", "3600"). */
export function getJwtExpiresIn(): string {
  return process.env.JWT_EXPIRES_IN ?? '15m';
}

/** Konversi "15m"/"7d"/detik-angka menjadi detik. */
export function parseExpiresInSeconds(value: string | number): number {
  if (typeof value === 'number') return Math.trunc(value);
  const match = /^(\d+)\s*([smhd])?$/.exec(value.trim());
  if (!match) throw new Error(`Format JWT_EXPIRES_IN tidak valid: "${value}"`);
  const amount = Number(match[1]);
  const unit = match[2] ?? 's';
  const multiplier: Record<string, number> = { s: 1, m: 60, h: 3600, d: 86400 };
  return amount * multiplier[unit];
}

function base64urlEncode(input: string): string {
  return Buffer.from(input, 'utf8').toString('base64url');
}

function signHs256(data: string, secret: string): string {
  return createHmac('sha256', secret).update(data).digest('base64url');
}

export function signJwt(
  input: JwtSignInput,
  secret: string = getJwtSecret(),
  expiresIn: string | number = getJwtExpiresIn(),
): string {
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + parseExpiresInSeconds(expiresIn);
  const header = base64urlEncode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = base64urlEncode(
    JSON.stringify({ ...input, iat, exp }),
  );
  const signature = signHs256(`${header}.${payload}`, secret);
  return `${header}.${payload}.${signature}`;
}

export function verifyJwt(
  token: string,
  secret: string = getJwtSecret(),
): JwtPayload {
  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new Error('Format token tidak valid');
  }
  const [header, payload, signature] = parts;
  const expected = signHs256(`${header}.${payload}`, secret);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    throw new Error('Signature token tidak valid');
  }
  const decoded = JSON.parse(
    Buffer.from(payload, 'base64url').toString('utf8'),
  ) as JwtPayload;
  if (
    typeof decoded.exp !== 'number' ||
    decoded.exp < Math.floor(Date.now() / 1000)
  ) {
    throw new Error('Token sudah kedaluwarsa');
  }
  return decoded;
}
