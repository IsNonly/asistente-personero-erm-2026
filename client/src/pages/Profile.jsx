import { useNavigate } from 'react-router-dom';
import Header from '../components/Header.jsx';
import { PERSONEROS } from '../data/personeros.js';
import { usePersonero } from '../context/PersoneroContext.jsx';

export default function Profile() {
  const navigate = useNavigate();
  const { perfilId, setPerfil } = usePersonero();

  function choose(id) {
    setPerfil(id);
    navigate('/');
  }

  return (
    <>
      <Header title="MI PERFIL" subtitle="Perfil de personero de la sesión" showBack />
      <div className="screen">
        <p className="muted" style={{ marginTop: 12 }}>
          Selecciona tu rol. Al elegir uno se actualiza tu perfil y vuelves al inicio.
        </p>

        <div className="selector__cards" style={{ marginTop: 12 }}>
          {PERSONEROS.map((p) => (
            <button
              key={p.id}
              className={`persona-card ${perfilId === p.id ? 'is-active' : ''}`}
              onClick={() => choose(p.id)}
            >
              <span>
                <span className="persona-card__label">{p.label}</span>
                <span className="persona-card__desc">{p.desc}</span>
              </span>
            </button>
          ))}
        </div>

        <p className="muted" style={{ marginTop: 16 }}>
          El perfil se guarda solo durante la sesión y se usa para contextualizar las
          respuestas del asistente.
        </p>
      </div>
    </>
  );
}
