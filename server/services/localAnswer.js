// Respuesta local con fundamento oficial (funciona sin API de IA).
//
// Empareja la consulta escrita por el usuario con la entrada más parecida de
// server/data/knowledge-base.json. Combina tres señales:
//   1) coincidencia de frase clave completa (fuerte),
//   2) coincidencia parcial de palabras de las frases clave,
//   3) solape de vocabulario con el texto de la respuesta (para lenguaje natural).
// Si la mejor coincidencia es sólida -> se usa su nivel de confianza.
// Si es razonable pero no sólida -> se responde igual, pero como "yellow" (verificar).
// Si no hay nada cercano -> null (pasa a IA o al mensaje de "sin fundamento").

import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const KB = require('../data/knowledge-base.json');

// Sinónimos / formas coloquiales -> término canónico (se aplica a la consulta).
const SYNONYMS = [
  [/\b(botan|botar|botaron|echan|echar|echaron|sacan|sacar|sacaron|expulsan|expulsar)\b/g, 'retirar'],
  [/\b(fotos?|fotito|fotografiar|fotografía|foto grafia)\b/g, 'fotografia'],
  [/\b(grabar|filmar|video|grabacion)\b/g, 'fotografia'],
  [/\b(plata|cuánto cuesta|cuanto cuesta|cuánto pago|cuanto pago|cobro|cobran)\b/g, 'tasa'],
  [/\b(abren|empieza|comienza|inicia|arranca)\b/g, 'hora'],
  [/\b(dni|documento de identidad|carné|carne|libreta electoral)\b/g, 'dni'],
  [/\b(caduco|caduca|caducado|caducada|caducos|expirado|expirada|malogrado|malograda)\b/g, 'vencido'],
  [/\b(reclamar|reclamo|quejarme|queja|denunciar|denuncia)\b/g, 'reclamo'],
  [/\b(papeleta|cedula|cédula)\b/g, 'cedula'],
  [/\b(conteo|contar los votos|contando)\b/g, 'escrutinio'],
  [/\b(local|colegio|escuela|centro de votacion|centro de votación)\b/g, 'local'],
  [/\b(miembro de mesa|miembros de mesa|presidente de mesa)\b/g, 'miembros de mesa'],
  [/\b(votante|votantes|electora|electores|electoras|sufragante)\b/g, 'elector'],
  [/\b(sufragar|puedo sufragar|va a sufragar)\b/g, 'votar'],
  [/\b(padron electoral|relacion de electores|lista de votantes)\b/g, 'padron'],
  [/\b(segunda vuelta|balotaje|ballotage|runoff)\b/g, 'segunda eleccion'],
];

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

function applySynonyms(text) {
  let t = ` ${text} `;
  for (const [re, rep] of SYNONYMS) t = t.replace(re, rep);
  return t.replace(/\s+/g, ' ').trim();
}

const STOPWORDS = new Set(
  normalize(
    'que como cual cuales cuando donde quien quienes por para con sin los las una unos unas ' +
      'del de la el en mi mis me se su sus y o a un una es son si no soy estoy tengo puedo debo ' +
      'hacer hago ser estar hay ante sobre tras entre mas más muy ya solo sólo pero tambien también ' +
      'esto esta este eso esa ese aqui aquí alla allá ahi ahí les nos le lo al'
  ).split(' ')
);

function tokenize(text) {
  return normalize(text)
    .split(' ')
    .filter((w) => w.length > 2 && !STOPWORDS.has(w));
}

// Construye el "vocabulario" de una entrada (para el solape con lenguaje natural).
function entryBag(entry) {
  if (entry.__bag) return entry.__bag;
  const src = [
    (entry.keywords || []).join(' '),
    (entry.sinonimos || []).join(' '),
    entry.categoria || '',
    // primeras ~60 palabras de la respuesta
    normalize(entry.respuesta || '').split(' ').slice(0, 60).join(' '),
  ].join(' ');
  const bag = new Set(tokenize(src));
  Object.defineProperty(entry, '__bag', { value: bag, enumerable: false });
  return bag;
}

function scoreEntry(entry, qNorm, qTokens) {
  let phrase = 0;
  let partial = 0;

  for (const kw of entry.keywords || []) {
    const kwNorm = normalize(kw);
    if (!kwNorm) continue;
    if (qNorm.includes(kwNorm)) {
      phrase += 7 + kwNorm.split(' ').length;
      continue;
    }
    const kwTokens = kwNorm.split(' ').filter((w) => w.length > 2);
    const hits = kwTokens.filter((w) => qTokens.includes(w)).length;
    if (kwTokens.length && hits) partial += (hits / kwTokens.length) * 3;
  }

  // Solape de vocabulario con la respuesta (ayuda con preguntas redactadas libremente).
  const bag = entryBag(entry);
  const overlap = qTokens.length
    ? qTokens.filter((w) => bag.has(w)).length / qTokens.length
    : 0;

  return {
    total: phrase + partial + overlap * 4,
    phrase,
    overlap,
  };
}

/**
 * @param {string} message
 * @param {string|null} [perfilId] - perfil activo de la sesión (personero_mesa, etc.).
 *   Las entradas con campo `perfiles` solo se consideran si el perfil activo está
 *   en esa lista (así "mis funciones" responde con el rol correcto y no con el de
 *   otro perfil). Si no se pasa perfilId, esas entradas no se excluyen.
 * @returns {null | {answer, base_normativa, fuente, confidence, classification, matchId, matchScore, loose}}
 */
export function findLocalAnswer(message, perfilId = null) {
  const qNorm = applySynonyms(normalize(message));
  const qTokens = tokenize(qNorm);
  if (!qNorm || qTokens.length === 0) return null;

  let best = null;
  let bestS = { total: 0, phrase: 0, overlap: 0 };

  for (const entry of KB.entradas) {
    if (perfilId && Array.isArray(entry.perfiles) && !entry.perfiles.includes(perfilId)) {
      continue; // entrada específica de otro perfil
    }
    const s = scoreEntry(entry, qNorm, qTokens);
    if (s.total > bestS.total) {
      bestS = s;
      best = entry;
    }
  }

  if (!best) return null;

  // Nivel sólido: frase clave clara o puntaje alto.
  const solid = bestS.phrase >= 6 || bestS.total >= 6.5;
  // Nivel aproximado: hay parentesco temático razonable.
  const loose =
    !solid &&
    bestS.total >= 4 &&
    bestS.overlap >= 0.34 &&
    qTokens.length >= 2;

  if (!solid && !loose) return null;

  const baseConf = best.confianza || 'yellow';
  // 'saludo' y similares no llevan semáforo de fundamento normativo.
  const confidence =
    best.mostrar_confianza === false ? null : solid ? baseConf : 'yellow';

  return {
    ...formatEntry(best, loose),
    confidence,
    classification: best.categoria || 'otros',
    matchId: best.id,
    matchScore: Number(bestS.total.toFixed(1)),
    loose,
  };
}

// Compone la respuesta con el formato RESPUESTA / BASE NORMATIVA / QUÉ PUEDES HACER /
// QUÉ NO DEBES HACER / SI OCURRE UNA INCIDENCIA
function formatEntry(entry, loose = false) {
  const parts = [];
  parts.push('RESPUESTA');
  parts.push(entry.respuesta);

  if (entry.base_normativa) {
    parts.push('');
    parts.push('BASE NORMATIVA');
    parts.push(entry.base_normativa);
  }

  if (Array.isArray(entry.puedes) && entry.puedes.length) {
    parts.push('');
    parts.push('QUÉ PUEDES HACER');
    parts.push(entry.puedes.map((x) => `• ${x}`).join('\n'));
  }

  if (Array.isArray(entry.no_debes) && entry.no_debes.length) {
    parts.push('');
    parts.push('QUÉ NO DEBES HACER');
    parts.push(entry.no_debes.map((x) => `• ${x}`).join('\n'));
  }

  if (entry.incidencia) {
    parts.push('');
    parts.push('SI OCURRE UNA INCIDENCIA');
    parts.push(entry.incidencia);
  }

  if (loose) {
    parts.push('');
    parts.push(
      'Esta es la respuesta más cercana a tu consulta en la base oficial local. ' +
        'Si no es lo que buscabas, reformula con otras palabras o revisa la sección Normativa.'
    );
  }

  return {
    answer: parts.join('\n'),
    base_normativa: entry.base_normativa || null,
    fuente: entry.fuente || null,
  };
}

export const KB_META = KB.meta;
export const KB_COUNT = KB.entradas.length;
