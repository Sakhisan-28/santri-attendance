import { UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service.js';
import { verifyJwt } from './jwt.utils.js';

const SECRET = 'test-secret-min-32-chars-0123456789';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    process.env.JWT_SECRET = SECRET;
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('login berhasil menghasilkan JWT yang valid', () => {
    const result = service.login('admin', '12345') as {
      username: string;
      access_token: string;
    };

    expect(result.username).toBe('admin');
    expect(result.access_token.split('.')).toHaveLength(3);

    const payload = verifyJwt(result.access_token, SECRET);
    expect(payload.username).toBe('admin');
    expect(payload.sub).toBeDefined();
  });

  it('login gagal dengan kredensial salah ditolak', () => {
    expect(() => service.login('admin', 'salah')).toThrow(
      UnauthorizedException,
    );
    expect(() => service.login('unknown', '12345')).toThrow(
      UnauthorizedException,
    );
  });
});
