import { Injectable, UnauthorizedException } from '@nestjs/common';
import { signJwt } from './jwt.utils.js';

@Injectable()
export class AuthService {
  login(username: string, password: string) {
    if (username === 'admin' && password === '12345') {
      return {
        message: 'Login berhasil',
        username: username,
        access_token: signJwt({ sub: '1', username }),
      };
    }

    throw new UnauthorizedException('Username atau password salah');
  }
}