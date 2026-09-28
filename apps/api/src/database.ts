
import pg from 'pg';

const { Pool } = pg;

export const pool = new Pool({
  user: process.env.DB_USERNAME ?? process.env.DB_USER ?? 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  database: process.env.DB_NAME ?? 'santri_attendance',
  password: process.env.DB_PASSWORD ?? '',
  port: Number(process.env.DB_PORT ?? 5432),
});

pool.query('SELECT NOW()')
  .then(() => {
    console.log('Database PostgreSQL berhasil terhubung');
  })
  .catch((error) => {
    console.error('Database gagal terhubung:', error.message);
  });