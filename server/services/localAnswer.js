// Respuesta local con fundamento oficial (funciona sin API de IA).
//
// Busca en server/data/knowledge-base.json la entrada más parecida a la consulta
// mediante coincidencia de palabras clave. Si no hay coincidencia suficiente,
// devuelve null y el flujo pasa a la IA (si está configurada) o al mensaje de
// "sin fundamento suficiente".

import { createRequire } from 'node:module';

// require() de JSON: funciona en local y permite que el empaquetador de Vercel
// (Node File Trace) incluya el archivo en la función serverless.
const require = createRequire(import.meta.url);
const KB = require('../data/knowledge-base.json');

// Quita acentos y signos, pasa a minúsculas.
export function normalize(text = '') {
  return String(text)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9ñ\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const STOPWORDS = new Set(
  normalize(
    'que como cual cuales cuando donde quien quienes por para con sin los las una unos unas del de la el en mi mis me se su sus y o a un es son si no soy tengo puedo debo hacer si hago'
  ).split(' ')
);

function tokens(text) {
  return normalize(text)
    .split(' ')
    .filter((w) => w.length > 2 && !STOPWORDS.has(w));
}

// Puntúa una entrada contra la consulta normalizada.
function score(entry, qNorm, qTokens) {
  let s = 0;

  for (const kw of entry.keywords || []) {
    const kwNorm = normalize(kw);
    if (!kwNorm) continue;
    if (qNorm.includes(kwNorm)) {
      // Frase clave completa encontrada: fuerte señal.
      s += 6 + kwNorm.split(' ').length;
      continue;
    }
    // Coincidencia parcial por palabras de la frase clave.
    const kwTokens = kwNorm.split(' ').filter((w) => w.length > 2);
    const hits = kwTokens.filter((w) => qTokens.includes(w)).length;
    if (kwTokens.length && hits) s += hits / kwTokens.length * 3;
  }

  return s;
}

/**
 * @returns {null | {answer, base_normativa, fuente, confidence, classification, matchId, matchScore}}
 */
export function findLocalAnswer(message) {
  const qNorm = normalize(message);
  const qTokens = tokens(message);
  if (!qNorm) return null;

  let best = null;
  let bestScore = 0;

  for (const entry of KB.entradas) {
    const s = score(entry, qNorm, qTokens);
    if (s > bestScore) {
      bestScore = s;
      best = entry;
    }
  }

  // Umbral: exige al menos una frase clave sólida o varias parciales.
  if (!best || bestScore < 6) return null;

  return {
    ...formatEntry(best),
    confidence: best.confianza || 'yellow',
    classification: best.categoria || 'otros',
    matchId: best.id,
    matchScore: Number(bestScore.toFixed(1)),
  };
}

// Compone la respuesta con el formato 📌 / ⚖️ / 📚 / ✅ / ❌ / 🚨
function formatEntry(entry) {
  const parts = [];
  parts.push('📌 RESPUESTA');
  parts.push(entry.respuesta);

  if (entry.base_normativa) {
    parts.push('');
    parts.push('⚖️ BASE NORMATIVA');
    parts.push(entry.base_normativa);
  }

  if (Array.isArray(entry.puedes) && entry.puedes.length) {
    parts.push('');
    parts.push('✅ QUÉ PUEDES HACER');
    parts.push(entry.puedes.map((x) => `• ${x}`).join('\n'));
  }

  if (Array.isArray(entry.no_debes) && entry.no_debes.length) {
    parts.push('');
    parts.push('❌ QUÉ NO DEBES HACER');
    parts.push(entry.no_debes.map((x) => `• ${x}`).join('\n'));
  }

  if (entry.incidencia) {
    parts.push('');
    parts.push('🚨 SI OCURRE UNA INCIDENCIA');
    parts.push(entry.incidencia);
  }

  return {
    answer: parts.join('\n'),
    base_normativa: entry.base_normativa || null,
    fuente: entry.fuente || null,
  };
}

export const KB_META = KB.meta;
export const KB_COUNT = KB.entradas.length;
