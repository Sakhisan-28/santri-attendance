import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { pool } from '../database.js';

@Controller('absensi')
export class AbsensiController {
  @Get()
  async getAllAbsensi(@Query('santri_id') santriId?: string) {
    let query = `
      SELECT a.*, s.nama, s.kelas
      FROM absensi a
      JOIN santri s ON a.santri_id = s.id
    `;
    const params: string[] = [];

    if (santriId) {
      query += ' WHERE a.santri_id = $1';
      params.push(santriId);
    }

    query += ' ORDER BY a.tanggal DESC, a.id DESC';

    const result = await pool.query(query, params);
    return result.rows;
  }

  @Get(':id')
  async getAbsensiById(@Param('id') id: string) {
    const result = await pool.query(
      `SELECT a.*, s.nama, s.kelas
       FROM absensi a
       JOIN santri s ON a.santri_id = s.id
       WHERE a.id = $1`,
      [id],
    );

    return result.rows[0];
  }

  @Post()
  async createAbsensi(
    @Body() body: { santri_id: number; tanggal: string; status: string },
  ) {
    const validStatuses = ['Hadir', 'Izin', 'Sakit', 'Alpha'];
    if (!validStatuses.includes(body.status)) {
      return { message: 'Status tidak valid. Gunakan: Hadir, Izin, Sakit, Alpha' };
    }

    const santriCheck = await pool.query(
      'SELECT id FROM santri WHERE id = $1',
      [body.santri_id],
    );

    if (santriCheck.rows.length === 0) {
      return { message: `Santri dengan ID ${body.santri_id} tidak ditemukan` };
    }

    const result = await pool.query(
      `INSERT INTO absensi (santri_id, tanggal, status) VALUES ($1, $2, $3) RETURNING *`,
      [body.santri_id, body.tanggal, body.status],
    );

    return result.rows[0];
  }

  @Put(':id')
  async updateAbsensi(
    @Param('id') id: string,
    @Body() body: { santri_id: number; tanggal: string; status: string },
  ) {
    const validStatuses = ['Hadir', 'Izin', 'Sakit', 'Alpha'];
    if (!validStatuses.includes(body.status)) {
      return { message: 'Status tidak valid. Gunakan: Hadir, Izin, Sakit, Alpha' };
    }

    const santriCheck = await pool.query(
      'SELECT id FROM santri WHERE id = $1',
      [body.santri_id],
    );

    if (santriCheck.rows.length === 0) {
      return { message: `Santri dengan ID ${body.santri_id} tidak ditemukan` };
    }

    const result = await pool.query(
      `UPDATE absensi SET santri_id = $1, tanggal = $2, status = $3 WHERE id = $4 RETURNING *`,
      [body.santri_id, body.tanggal, body.status, id],
    );

    if (result.rows.length === 0) {
      return { message: `Absensi dengan ID ${id} tidak ditemukan` };
    }

    return result.rows[0];
  }

  @Delete(':id')
  async deleteAbsensi(@Param('id') id: string) {
    const result = await pool.query(
      'DELETE FROM absensi WHERE id = $1 RETURNING *',
      [id],
    );

    if (result.rows.length === 0) {
      return { message: `Absensi dengan ID ${id} tidak ditemukan` };
    }

    return { message: `Absensi dengan ID ${id} berhasil dihapus` };
  }
}