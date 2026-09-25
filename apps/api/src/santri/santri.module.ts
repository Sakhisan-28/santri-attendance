import { Module } from '@nestjs/common';
import { SantriController } from './santri.controller.js';

@Module({
  controllers: [SantriController]
})
export class SantriModule {}
