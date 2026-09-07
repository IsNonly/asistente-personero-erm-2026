import { QUICK_QUESTIONS } from '../data/quickQuestions.js';

// Preguntas rápidas con desplazamiento horizontal (optimizado para móvil).
export default function QuickQuestions({ onPick }) {
  return (
    <div className="quick-questions" role="list" aria-label="Preguntas rápidas">
      {QUICK_QUESTIONS.map((q) => (
        <button
          key={q}
          type="button"
          role="listitem"
          className="quick-questions__chip"
          onClick={() => onPick(q)}
        >
          {q}
        </button>
      ))}
    </div>
  );
}
