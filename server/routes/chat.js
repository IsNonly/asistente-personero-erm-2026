import { Router } from 'express';
import { classify } from '../services/classifier.js';
import { retrieve, buildContextBlock } from '../services/rag.js';
import { generateAnswer, isAiEnabled } from '../services/ai.js';
import { findLocalAnswer } from '../services/localAnswer.js';

const router = Router();

const NO_BASIS_MESSAGE =
  '📌 RESPUESTA\n' +
  'No encuentro fundamento oficial suficiente para responder esta consulta con seguridad. ' +
  'Verifica la normativa vigente del JNE u ONPE.\n\n' +
  '📚 FUENTE\n' +
  'Sin fuente disponible en la base local. Revisa la sección Normativa de la app y los portales oficiales ' +
  '(jne.gob.pe, onpe.gob.pe).';

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

    // 1) Base de respuestas local con fundamento oficial (no requiere IA).
    const local = findLocalAnswer(text);
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
