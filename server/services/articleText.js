// Texto literal de artículos, extraído en caliente desde los documentos oficiales
// en /knowledge (los mismos .txt que respaldan la base de respuestas local).
//
// Objetivo: cuando el personero pregunta "¿qué dice el artículo 16?" (después de que
// el asistente lo citó como base normativa), se le muestra el texto tal cual figura
// en la norma, en vez de solo repetir la referencia "art. 16".
//
// No todos los documentos de /knowledge tienen estructura de "Artículo N.-" (las
// cartillas ONPE y los manuales internos no la tienen; la Res. 0838-2025-JNE está
// redactada por "numerales" en vez de artículos). Esos casos simplemente no quedan
// indexados y la búsqueda de artículo no encuentra nada ahí.

import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const KNOWLEDGE_DIR = path.resolve(__dirname, '../../knowledge');

// Fuentes con estructura de artículos suficientemente clara para extraer texto literal.
// `files`: si hay más de uno, el primero manda (texto más limpio) y el siguiente solo
// aporta los artículos que falten en el anterior.
// `alias`: patrones para reconocer la norma mencionada en un mensaje o en una respuesta
// previa del asistente (para saber a qué ley pertenece el número de artículo pedido).
const SOURCES = [
  {
    id: 'res-0850-2025-jne',
    label: 'Reglamento sobre la Participación de Personeros (Res. 0850-2025-JNE)',
    files: ['JNE/res-0850-2025-jne.txt'],
    alias: [/0850[\s-]?2025[\s-]?jne/i, /reglamento de personeros/i],
  },
  {
    id: 'res-0852-2025-jne',
    label: 'Reglamento sobre Recuento de Votos (Res. 0852-2025-JNE)',
    files: ['JNE/res-0852-2025-jne.txt'],
    alias: [/0852[\s-]?2025[\s-]?jne/i, /recuento de votos/i],
  },
  {
    id: 'res-0837-2025-jne',
    label: 'Reglamento de actas observadas, votos impugnados y nulidad (Res. 0837-2025-JNE)',
    files: ['JNE/res-0837-2025-jne.txt'],
    alias: [/0837[\s-]?2025[\s-]?jne/i],
  },
  {
    id: 'res-0844-2025-jne',
    label: 'Reglamento sobre propaganda electoral, publicidad estatal y neutralidad (Res. 0844-2025-JNE)',
    files: ['JNE/res-0844-2025-jne.txt'],
    alias: [/0844[\s-]?2025[\s-]?jne/i],
  },
  {
    id: 'res-0845-2025-jne',
    label: 'Reglamento sobre fiscalización y sanción de conductas prohibidas (Res. 0845-2025-JNE)',
    files: ['JNE/res-0845-2025-jne.txt'],
    alias: [/0845[\s-]?2025[\s-]?jne/i],
  },
  {
    id: 'res-0834-2025-jne',
    label: 'Reglamento sobre encuestas y simulacros de votación (Res. 0834-2025-JNE)',
    files: ['JNE/res-0834-2025-jne.txt'],
    alias: [/0834[\s-]?2025[\s-]?jne/i],
  },
  {
    id: 'res-0839-2025-jne',
    label: 'Reglamento sobre competencias del JNE en voto digital (Res. 0839-2025-JNE)',
    files: ['JNE/res-0839-2025-jne.txt'],
    alias: [/0839[\s-]?2025[\s-]?jne/i],
  },
  {
    id: 'res-0003-2026-jne',
    label: 'Cronograma electoral actualizado (Res. 0003-2026-JNE)',
    files: ['JNE/res-0003-2026-jne.txt'],
    alias: [/0003[\s-]?2026[\s-]?jne/i],
  },
  {
    id: 'loe-26859',
    label: 'Ley Orgánica de Elecciones (Ley N.° 26859)',
    // El extracto "articulos-clave" está curado para este asistente (texto más limpio);
    // la versión completa solo se usa para los artículos que el extracto no cubre.
    files: ['LEYES/loe-26859-articulos-clave.txt', 'LEYES/loe-26859-completa.txt'],
    alias: [/ley\s*(n[.°º]?\s*)?26859/i, /\bloe\b/i, /ley org[aá]nica de elecciones/i],
  },
  {
    id: 'ley-26864',
    label: 'Ley de Elecciones Municipales (Ley N.° 26864)',
    files: ['LEYES/ley-26864-elecciones-municipales.txt'],
    alias: [/ley\s*(n[.°º]?\s*)?26864/i, /elecciones municipales/i],
  },
  {
    id: 'ley-27683',
    label: 'Ley de Elecciones Regionales (Ley N.° 27683)',
    files: ['LEYES/ley-27683-elecciones-regionales.txt'],
    alias: [/ley\s*(n[.°º]?\s*)?27683/i, /elecciones regionales/i],
  },
];

// Ruido repetido de la maquetación en PDF (encabezados/pies de página) que aparece
// intercalado en medio del texto de los artículos.
const NOISE_LINE_PATTERNS = [
  /^\d{1,4}$/,
  /^—?\s*\d{1,4}\s*—?$/,
  /^normas legales( actualizadas)?$/i,
  /^el peruano\s*$/i,
  /^\/\s*$/,
  /^(lunes|martes|mi[ée]rcoles|jueves|viernes|s[áa]bado|domingo)\s+\d{1,2}\s+de\s+\w+\s+de\s+\d{4}\.?$/i,
  /^el peruano\s*\/\s*(lunes|martes|mi[ée]rcoles|jueves|viernes|s[áa]bado|domingo)\s+\d{1,2}\s+de\s+\w+\s+de\s+\d{4}\.?$/i,
  /^jurado nacional de elecciones$/i,
  /^resoluci[oó]n\s+n[.°º]?\s*\d/i,
  /^\d{4,}-\d+$/,
  /^compendio de(\s+legislaci[oó]n electoral)?$/i,
  /^legislaci[oó]n electoral$/i,
  /^ley\s*n[.°º0]*\s*26859\s*[-–—]\s*ley org[aá]nica de elecciones$/i,
  /^=+$/,
];

// Encabezados de título/capítulo/sección: se descartan junto con la línea de título
// en mayúsculas que suele seguirlos.
const SECTION_HEADING_RE = /^(T[ÍI]TULO|CAP[ÍI]TULO|SECCI[ÓO]N)\b/i;

// "Artículo N.-" al inicio de línea, después de punto/dos puntos (dos artículos
// pegados en la misma línea por la extracción del PDF), o después de un rótulo en
// mayúsculas al inicio de línea (frecuente en la LOE: "JUSTIFICACIÓN DE INASISTENCIA
// Artículo 253.-").
const ARTICLE_RE =
  /(?:^|(?<=[.:]\s)|(?<=^[A-ZÁÉÍÓÚÑÜ0-9 ,.\-]{1,80}))Art[ií]culo\s+([0-9]+(?:-\w+)?|[IVXLCDM]+)\b\s*[°ºª]?\.?-?\s*/gmu;

// Rótulo en mayúsculas del artículo siguiente, que a veces queda pegado al final del
// texto extraído del artículo actual.
const TRAILING_LABEL_RE = /\s+[A-ZÁÉÍÓÚÑÜ0-9][A-ZÁÉÍÓÚÑÜ0-9 ,./\-]{2,89}$/;

function isNoise(line) {
  const t = line.trim();
  if (!t) return true;
  return NOISE_LINE_PATTERNS.some((re) => re.test(t));
}

function collapseSpaces(line) {
  return line.replace(/[ \t]{2,}/g, ' ').trim();
}

// "TÍTULO I: DISPOSICIONES GENERALES", "CAPÍTULO II", etc. Solo se recorta el
// rótulo del encabezado (y, si viene pegado en la misma línea, el título en
// mayúsculas que lo sigue) — nunca el resto de la línea, porque a veces el
// artículo 1 de una norma queda pegado justo después del encabezado.
const SECTION_PREFIX_RE =
  /^(?:T[ÍI]TULO|CAP[ÍI]TULO|SECCI[ÓO]N)\b\s*[IVXLCDM0-9]*\s*[:.\-]?\s*(?:[A-ZÁÉÍÓÚÑÜ][A-ZÁÉÍÓÚÑÜ0-9 ,.'\-]*?)?(?=\s+Art[ií]culo\b|\s*$)/;

function stripSectionHeadings(lines) {
  const out = [];
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    if (SECTION_HEADING_RE.test(line.trim())) {
      line = line.trim().replace(SECTION_PREFIX_RE, '').trim();
      if (!line) {
        const next = lines[i + 1];
        if (next && next.trim() && next.trim() === next.trim().toUpperCase() && next.trim().length <= 70) {
          i += 1; // también se descarta el título de la sección en su propia línea
        }
        continue;
      }
    }
    out.push(line);
  }
  return out;
}

function parseArticles(rawText) {
  const rawLines = rawText.split(/\r?\n/).map(collapseSpaces).filter((l) => !isNoise(l));
  const lines = stripSectionHeadings(rawLines);
  const joined = lines.join('\n');

  const matches = [...joined.matchAll(ARTICLE_RE)];
  const map = new Map();

  matches.forEach((m, idx) => {
    const num = m[1].toUpperCase();
    const start = m.index;
    const end = idx + 1 < matches.length ? matches[idx + 1].index : joined.length;
    let text = joined.slice(start, end).replace(/\s+/g, ' ').trim();
    text = text.replace(TRAILING_LABEL_RE, '');

    const prev = map.get(num);
    if (!prev || text.length > prev.length) map.set(num, text);
  });

  return map;
}

let indexCache = null;

function buildIndex() {
  const index = new Map();
  for (const source of SOURCES) {
    const articles = new Map();
    for (const relPath of source.files) {
      const filePath = path.join(KNOWLEDGE_DIR, relPath);
      if (!existsSync(filePath)) continue;
      const raw = readFileSync(filePath, 'utf8');
      const parsed = parseArticles(raw);
      for (const [num, text] of parsed) {
        if (!articles.has(num)) articles.set(num, text); // el primer archivo listado manda
      }
    }
    index.set(source.id, { ...source, articles });
  }
  return index;
}

function getIndex() {
  if (!indexCache) indexCache = buildIndex();
  return indexCache;
}

// Reconoce qué normas se mencionan en un texto libre (respuesta previa o pregunta).
export function detectSourceIds(text = '') {
  const t = String(text);
  const ids = [];
  for (const source of getIndex().values()) {
    if (source.alias.some((re) => re.test(t))) ids.push(source.id);
  }
  return ids;
}

// Normas que el asistente cita pero de las que NO se tiene el texto cargado en
// /knowledge. Si el usuario pregunta por un artículo de una de estas, hay que
// decirlo con honestidad en vez de adivinar con el número de una norma distinta.
const UNSUPPORTED_SOURCES = [
  { match: /ley\s*(n[.°º]?\s*)?28094|ley de organizaciones pol[ií]ticas/i, label: 'la Ley de Organizaciones Políticas (Ley 28094)' },
  { match: /c[oó]digo penal/i, label: 'el Código Penal' },
  { match: /constituci[oó]n/i, label: 'la Constitución Política del Perú' },
  { match: /0838[\s-]?2025[\s-]?jne/i, label: 'la Res. 0838-2025-JNE (está redactada por numerales, no por artículos)' },
];

function detectUnsupportedLabels(text = '') {
  const t = String(text);
  return UNSUPPORTED_SOURCES.filter((u) => u.match.test(t)).map((u) => u.label);
}

// Extrae los números de artículo mencionados en un texto (admite "art.", "artículo",
// "arts." y rangos "22-26" / listas "9, 22 y 26").
export function extractArticleNumbers(text = '') {
  const t = String(text);
  const nums = new Set();

  const re =
    /\bart(?:(?:í|i)culos?|s?\.)\s*(?:n[°º.]?\s*)?((?:\d{1,4}(?:-[a-zA-Z])?(?:\s*(?:,|y|al|-|–|—)\s*\d{1,4}(?:-[a-zA-Z])?)*))/gi;
  let m;
  while ((m = re.exec(t))) {
    const chunk = m[1];
    const parts = chunk.split(/\s*,\s*|\s+y\s+/).filter(Boolean);
    for (const part of parts) {
      const range = part.match(/^(\d{1,4})\s*(?:al|-|–|—)\s*(\d{1,4})$/);
      if (range) {
        const from = Number(range[1]);
        const to = Number(range[2]);
        if (to - from <= 60) {
          for (let n = from; n <= to; n++) nums.add(String(n));
        }
      } else {
        const single = part.match(/^\d{1,4}(?:-[a-zA-Z])?$/);
        if (single) nums.add(single[0].toUpperCase());
      }
    }
  }
  return [...nums];
}

// Detecta si el mensaje del usuario está pidiendo el texto de uno o más artículos.
export function isArticleTextRequest(message = '') {
  const t = String(message).toLowerCase();
  const mentionsArticle = /art(?:í|i)culos?\b/.test(t);
  if (!mentionsArticle) return false;
  const asksToShow =
    /(qu[eé]\s+dice|dice\s+el|muestr|mu[eé]stra|ens[eé][ñn]a|texto\s+(completo|literal|del)|cu[aá]l\s+es\s+el\s+contenido|puedes\s+mostrar|c[oó]mo\s+dice|dime\s+qu[eé]\s+dice|leer\s+el)/.test(
      t
    );
  return asksToShow;
}

/**
 * @param {string} message - mensaje del usuario.
 * @param {string} [lastAssistantText] - último texto del asistente (para inferir de
 *   qué norma se habla si el usuario no lo repite, o si no da número y pregunta por
 *   "el artículo que mencionaste").
 * @returns {null | { answer: string, fuente: string, matches: Array }}
 */
export function findArticleText(message, lastAssistantText = '') {
  if (!isArticleTextRequest(message)) return null;

  let numbers = extractArticleNumbers(message);
  const impliedByPrevious = numbers.length === 0;
  if (impliedByPrevious) {
    numbers = extractArticleNumbers(lastAssistantText);
  }
  if (numbers.length === 0) return null;

  const combinedContext = `${message} ${lastAssistantText}`;
  const hintIds = [...new Set([...detectSourceIds(message), ...detectSourceIds(lastAssistantText)])];
  const unsupportedLabels = [...new Set(detectUnsupportedLabels(combinedContext))];

  // Si se nombró una norma explícita (cargada o no), solo se busca ahí: adivinar
  // con el número de artículo de otra norma distinta podría dar un texto que no
  // corresponde. Solo en un pedido totalmente ambiguo (sin ninguna norma nombrada)
  // se usa el Reglamento de personeros como norma por defecto y luego el resto.
  let searchOrder;
  if (hintIds.length) {
    searchOrder = hintIds;
  } else if (unsupportedLabels.length) {
    searchOrder = [];
  } else {
    searchOrder = [...getIndex().keys()].sort((a, b) =>
      a === 'res-0850-2025-jne' ? -1 : b === 'res-0850-2025-jne' ? 1 : 0
    );
  }

  const found = [];
  const notFound = [];

  for (const num of numbers) {
    let hit = null;
    for (const sourceId of searchOrder) {
      const source = getIndex().get(sourceId);
      if (source?.articles.has(num)) {
        hit = { num, sourceId, label: source.label, text: source.articles.get(num) };
        break;
      }
    }
    if (hit) found.push(hit);
    else notFound.push(num);
  }

  if (found.length === 0 && !unsupportedLabels.length) return null;

  const parts = [];
  if (impliedByPrevious && found.length) {
    parts.push(
      found.length > 1
        ? 'Esto dice cada artículo que mencioné:'
        : 'Esto dice el artículo que mencioné:'
    );
  }

  for (const hit of found) {
    parts.push('');
    parts.push(`Artículo ${hit.num} — ${hit.label}`);
    parts.push(`"${hit.text}"`);
  }

  if (notFound.length && unsupportedLabels.length) {
    parts.push('');
    parts.push(
      `No tengo cargado el texto de ${unsupportedLabels.join(' ni de ')} localmente, ` +
        `así que no puedo mostrarte el artículo ${notFound.join(', ')} tal cual; ` +
        'revísalo en el portal oficial de esa norma.'
    );
  } else if (notFound.length) {
    parts.push('');
    parts.push(
      `No tengo cargado el texto literal del artículo ${notFound.join(', ')}; ` +
        'verifícalo en el portal oficial de la norma correspondiente.'
    );
  }

  const fuente =
    found
      .map((h) => `${h.label}, art. ${h.num}`)
      .filter((v, i, arr) => arr.indexOf(v) === i)
      .join(' · ') || null;

  return {
    answer: parts.join('\n').trim(),
    fuente,
    matches: found,
  };
}

export const _internal = { parseArticles, getIndex };
