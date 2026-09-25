import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AuthModule } from './auth/auth.module.js';
import { SantriModule } from './santri/santri.module.js';
import { AbsensiModule } from './absensi/absensi.module.js';

@Module({
  imports: [AuthModule, SantriModule, AbsensiModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
