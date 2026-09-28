import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { getJwtSecret, signJwt, verifyJwt } from './jwt.utils.js';

const SECRET = 'test-secret-min-32-chars-0123456789';

describe('jwt.utils', () => {
  it('sign menghasilkan token 3 bagian yang bisa diverifikasi kembali', () => {
    const token = signJwt({ sub: '1', username: 'admin' }, SECRET, 900);

    expect(token.split('.')).toHaveLength(3);

    const payload = verifyJwt(token, SECRET);
    expect(payload.sub).toBe('1');
    expect(payload.username).toBe('admin');
    expect(payload.exp).toBeGreaterThan(payload.iat);
  });

  it('menolak token yang payload-nya diubah', () => {
    const token = signJwt({ sub: '1', username: 'admin' }, SECRET, 900);
    const [header, , signature] = token.split('.');
    const forgedPayload = Buffer.from(
      JSON.stringify({ sub: '2', username: 'admin', iat: 1, exp: 9999999999 }),
    ).toString('base64url');
    const forged = `${header}.${forgedPayload}.${signature}`;

    expect(() => verifyJwt(forged, SECRET)).toThrow();
  });

  it('menolak token yang ditandatangani dengan secret berbeda', () => {
    const token = signJwt({ sub: '1', username: 'admin' }, SECRET, 900);

    expect(() => verifyJwt(token, 'secret-lain-yang-berbeda-0123')).toThrow();
  });

  it('menolak token yang sudah kedaluwarsa', () => {
    const token = signJwt({ sub: '1', username: 'admin' }, SECRET, -10);

    expect(() => verifyJwt(token, SECRET)).toThrow(/kedaluwarsa/i);
  });

  it('menolak token yang formatnya rusak', () => {
    expect(() => verifyJwt('bukan-token', SECRET)).toThrow();
    expect(() => verifyJwt('', SECRET)).toThrow();
  });
});

describe('getJwtSecret', () => {
  const OLD_ENV = { ...process.env };

  beforeEach(() => {
    delete process.env.JWT_SECRET;
    delete process.env.NODE_ENV;
  });

  afterEach(() => {
    process.env = { ...OLD_ENV };
  });

  it('development tanpa JWT_SECRET masih bisa memakai fallback', () => {
    process.env.NODE_ENV = 'development';

    expect(getJwtSecret()).toBe(
      'development-only-secret-change-me-min-32-chars',
    );
  });

  it('tanpa NODE_ENV (default dev) tanpa JWT_SECRET masih memakai fallback', () => {
    expect(getJwtSecret()).toBe(
      'development-only-secret-change-me-min-32-chars',
    );
  });

  it('production tanpa JWT_SECRET melempar error yang jelas', () => {
    process.env.NODE_ENV = 'production';

    expect(() => getJwtSecret()).toThrow(/JWT_SECRET.*production/i);
  });

  it('JWT_SECRET yang tersedia tetap digunakan di semua environment', () => {
    for (const nodeEnv of ['development', 'test', 'production']) {
      process.env.NODE_ENV = nodeEnv;
      process.env.JWT_SECRET = SECRET;

      expect(getJwtSecret()).toBe(SECRET);
    }
  });
});
