/**
 * scripts/ingest.js
 * Carga documentos normativos de /knowledge en la tabla `documents`.
 *
 * Etapa 1: procesa archivos .txt y .md. Los .pdf se detectan y se listan,
 * pero su extracción de texto queda pendiente (añade un parser de PDF cuando
 * lo necesites, p. ej. `pdf-parse`).
 *
 * Cada documento puede acompañarse de un sidecar de metadatos con el mismo
 * nombre y extensión .json, por ejemplo:
 *
 *   knowledge/JNE/res-0850-2025-jne.txt
 *   knowledge/JNE/res-0850-2025-jne.json   <-- metadatos
 *
 * Formato del sidecar .json:
 * {
 *   "id": "res-0850-2025-jne",
 *   "entidad": "JNE",
 *   "tipo_documento": "Resolución",
 *   "numero": "N.° 0850-2025-JNE",
 *   "titulo": "Reglamento sobre participación de personeros...",
 *   "fecha_publicacion": "2025-01-01",
 *   "fecha_vigencia": null,
 *   "estado": "vigente",
 *   "version": "1",
 *   "proceso": "ERM 2026",
 *   "url_oficial": "",
 *   "prioridad": 1
 * }
 *
 * Uso:  node scripts/ingest.js
 */
import 'dotenv/config';
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join, extname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import pg from 'pg';

const __dirname = dirname(fileURLToPath(import.meta.url));
const KNOWLEDGE_DIR = join(__dirname, '..', 'knowledge');
const TEXT_EXT = new Set(['.txt', '.md']);
const CHUNK_SIZE = 1200; // caracteres aprox. por chunk
const CHUNK_OVERLAP = 150;

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}

function chunkText(text) {
  const clean = text.replace(/\r\n/g, '\n').trim();
  const chunks = [];
  let i = 0;
  while (i < clean.length) {
    const end = Math.min(i + CHUNK_SIZE, clean.length);
    chunks.push(clean.slice(i, end));
    if (end === clean.length) break;
    i = end - CHUNK_OVERLAP;
  }
  return chunks;
}

async function main() {
  if (!existsSync(KNOWLEDGE_DIR)) {
    console.error('No existe la carpeta /knowledge');
    process.exit(1);
  }

  const files = walk(KNOWLEDGE_DIR).filter(
    (f) =>
      !f.endsWith('.json') &&
      !f.endsWith('.gitkeep') &&
      !f.toLowerCase().endsWith('readme.md') &&
      !f.toLowerCase().endsWith('pendientes.md')
  );
  const textFiles = files.filter((f) => TEXT_EXT.has(extname(f).toLowerCase()));
  const pdfFiles = files.filter((f) => extname(f).toLowerCase() === '.pdf');

  console.log(`Encontrados: ${textFiles.length} archivo(s) de texto, ${pdfFiles.length} PDF.`);
  if (pdfFiles.length) {
    console.log('PDF pendientes de extracción de texto (añade un parser de PDF):');
    pdfFiles.forEach((f) => console.log('  - ' + f.replace(KNOWLEDGE_DIR, 'knowledge')));
  }

  if (!process.env.DATABASE_URL) {
    console.log('\nDATABASE_URL no configurada: modo simulación (no se escribe nada).');
    textFiles.forEach((f) => {
      const content = readFileSync(f, 'utf8');
      console.log(`  ${f.replace(KNOWLEDGE_DIR, 'knowledge')} -> ${chunkText(content).length} chunk(s)`);
    });
    return;
  }

  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

  for (const file of textFiles) {
    const rel = file.replace(KNOWLEDGE_DIR, 'knowledge');
    const sidecar = file.replace(extname(file), '.json');
    const meta = existsSync(sidecar) ? JSON.parse(readFileSync(sidecar, 'utf8')) : {};
    const id = meta.id || basename(file, extname(file));
    const content = readFileSync(file, 'utf8');

    await pool.query(
      `INSERT INTO documents (id, entidad, tipo_documento, numero, titulo,
         fecha_publicacion, fecha_vigencia, estado, version, proceso, url_oficial, prioridad, archivo_path)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
       ON CONFLICT (id) DO UPDATE SET
         titulo = EXCLUDED.titulo, estado = EXCLUDED.estado,
         version = EXCLUDED.version, url_oficial = EXCLUDED.url_oficial,
         archivo_path = EXCLUDED.archivo_path`,
      [
        id,
        meta.entidad || 'DESCONOCIDA',
        meta.tipo_documento || null,
        meta.numero || null,
        meta.titulo || basename(file),
        meta.fecha_publicacion || null,
        meta.fecha_vigencia || null,
        meta.estado || 'pendiente',
        meta.version || '1',
        meta.proceso || 'ERM 2026',
        meta.url_oficial || null,
        meta.prioridad ?? 5,
        rel,
      ]
    );

    await pool.query('DELETE FROM document_chunks WHERE document_id = $1', [id]);

    const chunks = chunkText(content);
    for (let idx = 0; idx < chunks.length; idx++) {
      await pool.query(
        `INSERT INTO document_chunks (document_id, chunk_index, contenido, tokens)
         VALUES ($1,$2,$3,$4)`,
        [id, idx, chunks[idx], Math.round(chunks[idx].length / 4)]
      );
    }
    console.log(`  OK ${rel} -> ${chunks.length} chunk(s) (embedding pendiente)`);
  }

  await pool.end();
  console.log('\nIngesta completada. Ejecuta `node scripts/embeddings.js` cuando el servicio de embeddings esté configurado.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
