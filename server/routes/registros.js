import { Router } from 'express';
import { isDbEnabled, query } from '../db.js';
import { isSupabaseEnabled, supabaseRequest } from '../services/supabase.js';

const router = Router();

// Memoria temporal cuando no hay base de datos configurada (se pierde al
// reiniciar el servidor; en producción configura DATABASE_URL).
const memoryStore = new Map();

const PERFILES = new Set([
  'personero_mesa',
  'personero_local',
  'coordinador_zonal',
  'coordinador_distrital',
]);

function cleanNombre(v) {
  if (typeof v !== 'string') return '';
  return v.replace(/\s+/g, ' ').trim().slice(0, 120);
}

// Celular peruano: 9 dígitos que empiezan con 9 (se acepta el prefijo +51).
export function cleanCelular(v) {
  if (typeof v !== 'string' && typeof v !== 'number') return '';
  let d = String(v).replace(/\D/g, '');
  if (d.length === 11 && d.startsWith('51')) d = d.slice(2);
  return /^9\d{8}$/.test(d) ? d : '';
}

// POST /api/registros — registra (o actualiza) a un personero por su celular.
router.post('/', async (req, res, next) => {
  try {
    const b = req.body || {};
    const nombre = cleanNombre(b.nombre);
    const celular = cleanCelular(b.celular);
    const perfil = PERFILES.has(b.perfil) ? b.perfil : null;

    if (nombre.length < 3) {
      return res.status(400).json({ error: 'Ingresa tu nombre completo.' });
    }
    if (!celular) {
      return res.status(400).json({ error: 'Ingresa un celular válido de 9 dígitos (empieza con 9).' });
    }

    // 1) Supabase (SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY)
    if (isSupabaseEnabled()) {
      const row = { nombre, celular, actualizado_en: new Date().toISOString() };
      if (perfil) row.perfil = perfil; // si no viene, no pisa el rol ya guardado
      const rows = await supabaseRequest('registros?on_conflict=celular', {
        method: 'POST',
        body: row,
        prefer: 'resolution=merge-duplicates,return=representation',
      });
      return res.status(201).json({ storage: 'supabase', id: rows[0].id, creado_en: rows[0].creado_en });
    }

    // 2) PostgreSQL directo (DATABASE_URL)
    if (isDbEnabled()) {
      const r = await query(
        `INSERT INTO registros (nombre, celular, perfil)
         VALUES ($1, $2, $3)
         ON CONFLICT (celular) DO UPDATE
           SET nombre = EXCLUDED.nombre,
               perfil = COALESCE(EXCLUDED.perfil, registros.perfil),
               actualizado_en = now()
         RETURNING id, creado_en`,
        [nombre, celular, perfil]
      );
      return res.status(201).json({ storage: 'database', id: r.rows[0].id, creado_en: r.rows[0].creado_en });
    }

    const prev = memoryStore.get(celular);
    const saved = {
      id: prev?.id || `reg_${Date.now()}`,
      nombre,
      celular,
      perfil: perfil || prev?.perfil || null,
      creado_en: prev?.creado_en || new Date().toISOString(),
      actualizado_en: new Date().toISOString(),
    };
    memoryStore.set(celular, saved);
    res.status(201).json({ storage: 'memory', id: saved.id, creado_en: saved.creado_en });
  } catch (err) {
    next(err);
  }
});

// GET /api/registros — lista de registrados. Son datos personales, así que solo
// responde si el servidor tiene ADMIN_TOKEN y la petición lo envía en la
// cabecera "x-admin-token" (o ?token=...). Con ?formato=csv devuelve un CSV.
router.get('/', async (req, res, next) => {
  try {
    const expected = process.env.ADMIN_TOKEN;
    const given = req.get('x-admin-token') || req.query.token;
    if (!expected || given !== expected) {
      return res.status(401).json({ error: 'No autorizado.' });
    }

    let items;
    let storage = 'memory';
    if (isSupabaseEnabled()) {
      items = await supabaseRequest(
        'registros?select=id,nombre,celular,perfil,creado_en,actualizado_en&order=creado_en.desc'
      );
      storage = 'supabase';
    } else if (isDbEnabled()) {
      storage = 'database';
      const r = await query(
        `SELECT id, nombre, celular, perfil, creado_en, actualizado_en
         FROM registros ORDER BY creado_en DESC`
      );
      items = r.rows;
    } else {
      items = [...memoryStore.values()].sort((a, b) => (a.creado_en < b.creado_en ? 1 : -1));
    }

    if (req.query.formato === 'csv') {
      const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
      const rows = [['nombre', 'celular', 'perfil', 'creado_en']]
        .concat(items.map((i) => [i.nombre, i.celular, i.perfil, i.creado_en instanceof Date ? i.creado_en.toISOString() : i.creado_en]))
        .map((r) => r.map(esc).join(','));
      res.set('Content-Type', 'text/csv; charset=utf-8');
      res.set('Content-Disposition', 'attachment; filename="registros-personeros.csv"');
      return res.send('﻿' + rows.join('\n'));
    }

    res.json({ storage, total: items.length, items });
  } catch (err) {
    next(err);
  }
});

export default router;
