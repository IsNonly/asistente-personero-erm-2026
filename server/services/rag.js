// Recuperación (Retrieval) para RAG.
//
// Etapa 1: no hay documentos indexados todavía, por lo que `retrieve` devuelve [].
// El asistente, al no recibir contexto, responderá con nivel de confianza "red"
// y el mensaje de "no hay fundamento oficial suficiente".
//
// Flujo objetivo:
//   pregunta -> perfil -> clasificación -> retrieve() -> contexto -> IA -> respuesta + fuente
//
// Implementación futura de retrieve():
//   1. Generar embedding de la consulta (services/embeddings.js)
//   2. Buscar los k chunks más cercanos en document_chunks (pgvector / similitud coseno)
//   3. Devolver [{ texto, documento, articulo, pagina, url_oficial, prioridad }]

import { isDbEnabled, query } from '../db.js';

export async function retrieve({ message, categoria, k = 5 }) {
  if (!isDbEnabled()) return [];

  try {
    // Marcador de posición: sin embeddings solo se comprueba si existen chunks.
    const res = await query('SELECT COUNT(*)::int AS n FROM document_chunks');
    if (!res.rows[0] || res.rows[0].n === 0) return [];

    // TODO(RAG): reemplazar por búsqueda vectorial real.
    return [];
  } catch {
    return [];
  }
}

export function buildContextBlock(chunks = []) {
  if (!chunks.length) return '';
  return chunks
    .map(
      (c, i) =>
        `[FUENTE ${i + 1}] ${c.documento || ''} ${c.articulo || ''} ${c.pagina ? '(p. ' + c.pagina + ')' : ''}\n${c.texto || ''}`
    )
    .join('\n\n');
}
