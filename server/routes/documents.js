import { Router } from 'express';
import { isDbEnabled, query } from '../db.js';

const router = Router();

// GET /api/documents — lista de documentos normativos indexados.
router.get('/', async (req, res, next) => {
  try {
    if (!isDbEnabled()) {
      return res.json({ storage: 'none', items: [], note: 'Base de datos no configurada.' });
    }
    const r = await query(
      `SELECT id, entidad, tipo_documento, numero, titulo, fecha_publicacion,
              estado, version, proceso, url_oficial, prioridad
       FROM documents ORDER BY prioridad ASC, entidad ASC`
    );
    res.json({ storage: 'database', items: r.rows });
  } catch (err) {
    next(err);
  }
});

// GET /api/documents/:id/chunks — trozos indexados de un documento.
router.get('/:id/chunks', async (req, res, next) => {
  try {
    if (!isDbEnabled()) return res.json({ items: [] });
    const r = await query(
      `SELECT id, chunk_index, contenido, seccion, articulo, pagina
       FROM document_chunks WHERE document_id = $1 ORDER BY chunk_index ASC`,
      [req.params.id]
    );
    res.json({ items: r.rows });
  } catch (err) {
    next(err);
  }
});

export default router;
