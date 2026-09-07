/**
 * scripts/embeddings.js
 * Genera embeddings para los chunks que aún no lo tienen.
 *
 * REQUISITO: implementar `embed()` en server/services/embeddings.js
 * (elige un proveedor de embeddings; Anthropic no ofrece endpoint propio).
 *
 * Uso:  node scripts/embeddings.js
 */
import 'dotenv/config';
import pg from 'pg';
import { embed, EMBEDDINGS_ENABLED } from '../server/services/embeddings.js';

async function main() {
  if (!EMBEDDINGS_ENABLED) {
    console.log('Servicio de embeddings pendiente de configuración.');
    console.log('Implementa server/services/embeddings.js y pon EMBEDDINGS_ENABLED = true.');
    return;
  }
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL no configurada.');
    process.exit(1);
  }

  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
  const { rows } = await pool.query(
    `SELECT id, contenido FROM document_chunks WHERE embedding IS NULL ORDER BY id ASC`
  );

  console.log(`Chunks sin embedding: ${rows.length}`);
  for (const row of rows) {
    const vector = await embed(row.contenido);
    await pool.query('UPDATE document_chunks SET embedding = $1 WHERE id = $2', [
      JSON.stringify(vector),
      row.id,
    ]);
    console.log(`  chunk ${row.id} -> embedding generado`);
  }

  await pool.end();
  console.log('Listo.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
