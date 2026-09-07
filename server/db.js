import pg from 'pg';

const { Pool } = pg;

let pool = null;

if (process.env.DATABASE_URL) {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 5,
    idleTimeoutMillis: 30000,
  });
  pool.on('error', (err) => console.error('[db] error inesperado en el pool', err));
}

export function isDbEnabled() {
  return Boolean(pool);
}

export async function query(text, params) {
  if (!pool) throw new Error('DATABASE_URL no configurada');
  return pool.query(text, params);
}

export default pool;
