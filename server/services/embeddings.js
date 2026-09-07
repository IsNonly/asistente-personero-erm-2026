// Servicio de embeddings — PENDIENTE de configuración.
//
// Cuando se integre RAG, aquí se genera el vector de un texto para
// almacenarlo/consultarlo en `document_chunks.embedding`.
//
// Opciones habituales:
//  - Un proveedor de embeddings (p. ej. OpenAI text-embedding-3-*, Voyage, etc.)
//  - Un modelo local (transformers.js, Ollama)
//
// Anthropic no expone endpoint de embeddings propio; combina Claude (generación)
// con un proveedor de embeddings para la recuperación.

export const EMBEDDINGS_ENABLED = false;
export const EMBEDDING_DIM = 1536; // ajusta según el proveedor elegido

export async function embed(_text) {
  throw new Error(
    'Servicio de embeddings pendiente de configuración. ' +
      'Implementa server/services/embeddings.js antes de ejecutar scripts/embeddings.js'
  );
}

export async function embedBatch(_texts) {
  throw new Error('Servicio de embeddings pendiente de configuración.');
}
