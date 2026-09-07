import { Router } from 'express';
import { isDbEnabled, query } from '../db.js';

const router = Router();

// Memoria temporal cuando no hay base de datos configurada.
const memoryStore = [];

function sanitizeText(v, max = 2000) {
  if (typeof v !== 'string') return '';
  return v.trim().slice(0, max);
}

// POST /api/incidents
router.post('/', async (req, res, next) => {
  try {
    const b = req.body || {};
    const record = {
      tipo_personero: sanitizeText(b.tipo_personero, 40),
      local_votacion: sanitizeText(b.local_votacion, 200),
      mesa_sufragio: sanitizeText(b.mesa_sufragio, 20),
      fecha: sanitizeText(b.fecha, 20),
      hora: sanitizeText(b.hora, 20),
      categoria: sanitizeText(b.categoria, 40),
      descripcion: sanitizeText(b.descripcion, 4000),
      evidencia: sanitizeText(b.evidencia, 300),
    };

    if (!record.descripcion) {
      return res.status(400).json({ error: 'La descripción es obligatoria.' });
    }

    if (isDbEnabled()) {
      const r = await query(
        `INSERT INTO incidents
          (tipo_personero, local_votacion, mesa_sufragio, fecha, hora, categoria, descripcion, evidencia)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
         RETURNING id, creado_en`,
        [
          record.tipo_personero,
          record.local_votacion,
          record.mesa_sufragio,
          record.fecha || null,
          record.hora || null,
          record.categoria,
          record.descripcion,
          record.evidencia,
        ]
      );
      return res.status(201).json({ storage: 'database', id: r.rows[0].id, creado_en: r.rows[0].creado_en });
    }

    const saved = { id: `inc_${Date.now()}`, creado_en: new Date().toISOString(), ...record };
    memoryStore.unshift(saved);
    res.status(201).json({ storage: 'memory', id: saved.id, creado_en: saved.creado_en });
  } catch (err) {
    next(err);
  }
});

// GET /api/incidents
router.get('/', async (req, res, next) => {
  try {
    if (isDbEnabled()) {
      const r = await query(
        `SELECT id, tipo_personero, local_votacion, mesa_sufragio, fecha, hora,
                categoria, descripcion, evidencia, creado_en
         FROM incidents ORDER BY creado_en DESC LIMIT 100`
      );
      return res.json({ storage: 'database', items: r.rows });
    }
    res.json({ storage: 'memory', items: memoryStore });
  } catch (err) {
    next(err);
  }
});

export default router;
