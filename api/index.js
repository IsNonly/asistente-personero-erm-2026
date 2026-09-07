// Punto de entrada para Vercel (Serverless Function).
// Vercel enruta /api/* a este archivo (ver vercel.json) y una app Express
// funciona directamente como handler (req, res).
import app from '../server/app.js';

export default app;
