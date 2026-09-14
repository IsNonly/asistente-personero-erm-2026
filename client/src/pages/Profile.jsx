import Header from '../components/Header.jsx';
import { PERSONEROS } from '../data/personeros.js';
import { usePersonero } from '../context/PersoneroContext.jsx';

export default function Profile() {
  const { perfil, setPerfil, clearPerfil } = usePersonero();

  return (
    <>
      <Header title="MI PERFIL" subtitle="Perfil de personero de la sesión" showBack />
      <div className="screen">
        {perfil ? (
          <div className="profile-badge" style={{ marginTop: 14 }}>
            <div>
              <strong>{perfil.label}</strong>
              <div className="muted">{perfil.desc}</div>
            </div>
          </div>
        ) : (
          <p className="center-hint">No has seleccionado un perfil.</p>
        )}

        <div className="section-title">Cambiar perfil</div>
        <div className="stack">
          {PERSONEROS.map((p) => (
            <button
              key={p.id}
              className={`option-item ${perfil?.id === p.id ? '' : ''}`}
              onClick={() => setPerfil(p.id)}
            >
              <span>{p.label}</span>
              {perfil?.id === p.id && <span className="option-item__chevron">✓</span>}
            </button>
          ))}
        </div>

        <button className="btn btn--block btn--ghost" style={{ marginTop: 16 }} onClick={clearPerfil}>
          Borrar perfil de la sesión
        </button>

        <p className="muted" style={{ marginTop: 16 }}>
          El perfil se guarda solo durante la sesión y se usa para contextualizar las
          respuestas del asistente.
        </p>
      </div>
    </>
  );
}
