import { Test, TestingModule } from '@nestjs/testing';
import { AbsensiController } from './absensi.controller.js';

describe('AbsensiController', () => {
  let controller: AbsensiController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AbsensiController],
    }).compile();

    controller = module.get<AbsensiController>(AbsensiController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});