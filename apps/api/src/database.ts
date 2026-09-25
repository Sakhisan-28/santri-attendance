
import pg from 'pg';

const { Pool } = pg;

export const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'santri_attendance',
  password: 'Sakhisan',
  port: 5432,
});

pool.query('SELECT NOW()')
  .then(() => {
    console.log('Database PostgreSQL berhasil terhubung');
  })
  .catch((error) => {
    console.error('Database gagal terhubung:', error.message);
  });