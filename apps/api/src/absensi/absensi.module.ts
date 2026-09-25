import { Module } from '@nestjs/common';
import { AbsensiController } from './absensi.controller.js';

@Module({
  controllers: [AbsensiController],
})
export class AbsensiModule {}