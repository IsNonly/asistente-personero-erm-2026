import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import chatRouter from './routes/chat.js';
import incidentsRouter from './routes/incidents.js';
import documentsRouter from './routes/documents.js';
import registrosRouter from './routes/registros.js';
import { isDbEnabled } from './db.js';
import { isAiEnabled } from './services/ai.js';
import { KB_META, KB_COUNT } from './services/localAnswer.js';

// App Express reutilizable: se usa tanto en el servidor local (server/index.js)
// como en la función serverless de Vercel (api/index.js).
const app = express();

app.use(cors());

// En algunas plataformas serverless (p. ej. Vercel) el cuerpo JSON ya viene
// parseado en req.body. En ese caso marcamos req._body para que express.json()
// no intente volver a leer un stream ya consumido.
app.use((req, _res, next) => {
  if (req.body && typeof req.body === 'object') req._body = true;
  next();
});
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    ai: isAiEnabled(),
    database: isDbEnabled(),
    knowledge_base: { entradas: KB_COUNT, fuentes: (KB_META.fuentes || []).length },
    proceso: 'ERM 2026',
  });
});

app.use('/api/chat', chatRouter);
app.use('/api/incidents', incidentsRouter);
app.use('/api/documents', documentsRouter);
app.use('/api/registros', registrosRouter);

// Manejo de errores centralizado
app.use((err, req, res, next) => {
  console.error('[error]', err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

export default app;
