import Header from '../components/Header.jsx';
import { usePersonero } from '../context/PersoneroContext.jsx';

export default function Profile() {
  const { perfil, clearPerfil } = usePersonero();

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

        <button className="btn btn--block btn--accent" style={{ marginTop: 16 }} onClick={clearPerfil}>
          Cambiar de perfil
        </button>

        <p className="muted" style={{ marginTop: 16 }}>
          El perfil se guarda solo durante la sesión y se usa para contextualizar las
          respuestas del asistente.
        </p>
      </div>
    </>
  );
}
