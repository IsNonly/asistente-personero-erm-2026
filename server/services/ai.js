import Anthropic from '@anthropic-ai/sdk';
import { MASTER_PROMPT } from '../prompts/personero-master.js';

const API_KEY = process.env.ANTHROPIC_API_KEY || '';
const MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-5';

const PENDING_MESSAGE =
  'Servicio de IA pendiente de configuración.\n\n' +
  'El asistente aún no tiene una clave de IA configurada (ANTHROPIC_API_KEY). ' +
  'Cuando se configure junto con la base normativa, aquí verás la respuesta con su fundamento oficial.';

const NO_BASIS_MESSAGE =
  'No encuentro fundamento oficial suficiente para responder esta consulta con seguridad. ' +
  'Verifica la normativa vigente del JNE u ONPE.';

let client = null;
if (API_KEY) client = new Anthropic({ apiKey: API_KEY });

export function isAiEnabled() {
  return Boolean(client);
}

/**
 * Genera una respuesta del asistente.
 * @returns {{answer:string, confidence:'green'|'yellow'|'red', pending:boolean, source:string|null}}
 */
export async function generateAnswer({ message, perfil, categoria, context = '', history = [] }) {
  if (!client) {
    return { answer: PENDING_MESSAGE, confidence: 'red', pending: true, source: null };
  }

  const hasContext = Boolean(context && context.trim());

  const system = MASTER_PROMPT.replace('{{PERFIL}}', perfil || 'no especificado').replace(
    '{{CATEGORIA}}',
    categoria || 'otros'
  );

  const contextBlock = hasContext
    ? `CONTEXTO NORMATIVO (fuentes oficiales recuperadas):\n${context}`
    : 'CONTEXTO NORMATIVO: (vacío — no hay documentos oficiales indexados todavía)';

  const messages = [
    ...history
      .filter((m) => m && m.content)
      .slice(-8)
      .map((m) => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: String(m.content),
      })),
    { role: 'user', content: `${contextBlock}\n\nCONSULTA DEL PERSONERO:\n${message}` },
  ];

  try {
    const res = await client.messages.create({
      model: MODEL,
      max_tokens: 900,
      temperature: 0.2,
      system,
      messages,
    });

    const answer = res.content
      .filter((b) => b.type === 'text')
      .map((b) => b.text)
      .join('\n')
      .trim();

    if (!answer) {
      return { answer: NO_BASIS_MESSAGE, confidence: 'red', pending: false, source: null };
    }

    // Nivel de confianza: con contexto oficial -> verde; sin contexto -> rojo/amarillo.
    let confidence = 'yellow';
    if (hasContext) confidence = 'green';
    if (answer.includes('No encuentro fundamento oficial suficiente')) confidence = 'red';

    return { answer, confidence, pending: false, source: null };
  } catch (err) {
    console.error('[ai] error llamando a Claude:', err.message);
    return {
      answer:
        'Servicio de IA pendiente de configuración.\n\n' +
        'Ocurrió un error al contactar el modelo de IA. Revisa la clave ANTHROPIC_API_KEY y el nombre del modelo.',
      confidence: 'red',
      pending: true,
      source: null,
    };
  }
}
