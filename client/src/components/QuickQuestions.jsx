import { useEffect, useRef, useState } from 'react';
import { QUICK_QUESTIONS } from '../data/quickQuestions.js';

// Preguntas rápidas con desplazamiento horizontal (optimizado para móvil).
export default function QuickQuestions({ onPick }) {
  const scrollRef = useRef(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  // El difuminado de cada borde solo se muestra si de verdad hay más
  // burbujas hacia ese lado; si no, se ve raro difuminar el primer/último chip.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    function update() {
      setCanLeft(el.scrollLeft > 4);
      setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
    }
    update();
    el.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      el.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  return (
    <>
      <div className="quick-questions__title">Preguntas frecuentes</div>
      <div
        className={`quick-questions ${canLeft ? 'can-scroll-left' : ''} ${canRight ? 'can-scroll-right' : ''}`}
        ref={scrollRef}
        role="list"
        aria-label="Preguntas rápidas"
      >
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
    </>
  );
}
