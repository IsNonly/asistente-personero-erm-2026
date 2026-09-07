import app from './app.js';
import { isDbEnabled } from './db.js';
import { isAiEnabled } from './services/ai.js';
import { KB_COUNT } from './services/localAnswer.js';

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Asistente del Personero — servidor en http://localhost:${PORT}`);
  console.log(`  IA:            ${isAiEnabled() ? 'configurada' : 'PENDIENTE (se usa la base local)'}`);
  console.log(`  Base local:    ${KB_COUNT} respuestas con fuente oficial`);
  console.log(`  Base de datos: ${isDbEnabled() ? 'conectada' : 'no configurada (modo local)'}`);
});
