import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  login(username: string, password: string) {
    if (username === 'admin' && password === '12345') {
      return {
        message: 'Login berhasil',
        username: username,
      };
    }

    return {
      message: 'Username atau password salah',
    };
  }
}