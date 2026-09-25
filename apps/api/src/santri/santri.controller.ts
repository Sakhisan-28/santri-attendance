import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { pool } from '../database.js';

@Controller('santri')
export class SantriController {
  @Get()
  async getAllSantri() {
    const result = await pool.query('SELECT * FROM santri');

    return result.rows;
  }

  @Get(':id')
  async getSantriById(@Param('id') id: string) {
    const result = await pool.query(
      'SELECT * FROM santri WHERE id = $1',
      [id],
    );

    return result.rows[0];
  }

  @Post()
  async createSantri(
    @Body() body: { nama: string; kelas: string; status: string },
  ) {
    const result = await pool.query(
      'INSERT INTO santri (nama, kelas, status) VALUES ($1, $2, $3) RETURNING *',
      [body.nama, body.kelas, body.status],
    );

    return result.rows[0];
  }

  @Put(':id')
  async updateSantri(
    @Param('id') id: string,
    @Body() body: { nama: string; kelas: string; status: string },
  ) {
    const result = await pool.query(
      'UPDATE santri SET nama = $1, kelas = $2, status = $3 WHERE id = $4 RETURNING *',
      [body.nama, body.kelas, body.status, id],
    );

    if (result.rows.length === 0) {
      return { message: `Santri with ID ${id} not found` };
    }

    return result.rows[0];
  }

  @Delete(':id')
  async deleteSantri(@Param('id') id: string) {
    const result = await pool.query(
      'DELETE FROM santri WHERE id = $1 RETURNING *',
      [id],
    );

    if (result.rows.length === 0) {
      return { message: `Santri with ID ${id} not found` };
    }

    return { message: `Santri with ID ${id} deleted successfully` };
  }
}