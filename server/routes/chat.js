import { Router } from 'express';
import { classify } from '../services/classifier.js';
import { retrieve, buildContextBlock } from '../services/rag.js';
import { generateAnswer, isAiEnabled } from '../services/ai.js';
import { findLocalAnswer } from '../services/localAnswer.js';
import { findArticleText } from '../services/articleText.js';

const router = Router();

const NO_BASIS_MESSAGE =
  'Todavía no tengo una respuesta con fundamento oficial para esa consulta exacta, así que prefiero no improvisar. ' +
  'Prueba a reformularla con otras palabras o desde otro ángulo.\n\n' +
  'Por ahora puedo ayudarte con temas como:\n' +
  '✓ Acreditación, tipos de personero y plazos\n' +
  '✓ Funciones y derechos del personero (mesa, centro de votación, legal, técnico)\n' +
  '✓ Instalación, sufragio y escrutinio\n' +
  '✓ Actas, copia del acta, votos válidos/nulos/en blanco/impugnados\n' +
  '✓ Observaciones y reclamos, prohibiciones y retiro\n' +
  '✓ Nulidad de mesa, actas observadas y recuento\n' +
  '✓ Propaganda, neutralidad, seguridad y delitos electorales\n' +
  '✓ El elector: DNI vencido, padrón, atención preferente, voto facultativo, multa por no votar\n' +
  '✓ El miembro de mesa: composición, compensación, multa\n' +
  '✓ Segunda elección regional y cronograma\n\n' +
  'Fuente: revisa también la sección Normativa de la app y los portales oficiales (jne.gob.pe, onpe.gob.pe, reniec.gob.pe).';

// POST /api/chat
router.post('/', async (req, res, next) => {
  try {
    const { message, perfil, history } = req.body || {};

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: 'El campo "message" es obligatorio.' });
    }
    if (message.length > 2000) {
      return res.status(400).json({ error: 'La consulta es demasiado larga.' });
    }

    const text = message.trim();
    const categoria = classify(text);

    // 0) ¿Piden el texto literal de un artículo que ya se citó (o que citan ahora)?
    const lastAssistantText =
      Array.isArray(history) && history.length
        ? [...history].reverse().find((m) => m?.role === 'assistant')?.content || ''
        : '';
    const article = findArticleText(text, lastAssistantText);
    if (article) {
      return res.json({
        answer: article.answer,
        confidence: article.matches.length ? 'green' : null,
        classification: 'normativa',
        pending: false,
        source: article.fuente,
        origin: 'articulo',
      });
    }

    // 1) Base de respuestas local con fundamento oficial (no requiere IA).
    const local = findLocalAnswer(text, perfil || null);
    if (local) {
      return res.json({
        answer: local.answer,
        confidence: local.confidence,
        classification: local.classification || categoria,
        pending: false,
        source: local.fuente || null,
        origin: 'local',
        match: local.matchId,
      });
    }

    // 2) IA + RAG (si hay clave configurada).
    if (isAiEnabled()) {
      const chunks = await retrieve({ message: text, categoria });
      const context = buildContextBlock(chunks);
      const result = await generateAnswer({
        message: text,
        perfil: perfil || null,
        categoria,
        context,
        history: Array.isArray(history) ? history : [],
      });
      return res.json({
        answer: result.answer,
        confidence: result.confidence,
        classification: categoria,
        pending: result.pending,
        source: result.source,
        origin: 'ai',
        sources_count: chunks.length,
      });
    }

    // 3) Sin cobertura local y sin IA: mensaje oficial de "sin fundamento".
    return res.json({
      answer: NO_BASIS_MESSAGE,
      confidence: 'red',
      classification: categoria,
      pending: false,
      source: null,
      origin: 'fallback',
    });
  } catch (err) {
    next(err);
  }
});

export default router;
