import { PERSONEROS } from '../data/personeros.js';
import { usePersonero } from '../context/PersoneroContext.jsx';

// Pantalla inicial: "¿Qué tipo de personero eres?"
export default function PersoneroSelector() {
  const { setPerfil, perfilId } = usePersonero();

  return (
    <div className="selector">
      <h1 className="selector__title">Asistente del Personero — ERM 2026</h1>
      <p className="selector__subtitle">
        Tu guía rápida para actuar con seguridad en cada etapa del proceso electoral.
        Consulta procedimientos, resuelve dudas y encuentra qué hacer ante las
        situaciones que puedan presentarse, según tu rol dentro del equipo de personeros.
      </p>

      <p className="selector__question">¿Qué tipo de personero eres?</p>

      <div className="selector__cards">
        {PERSONEROS.map((p) => (
          <button
            key={p.id}
            className={`persona-card ${perfilId === p.id ? 'is-active' : ''}`}
            onClick={() => setPerfil(p.id)}
          >
            <span>
              <span className="persona-card__label">{p.label}</span>
              <span className="persona-card__desc">{p.desc}</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
