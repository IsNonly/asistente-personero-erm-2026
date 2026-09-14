import { useNavigate } from 'react-router-dom';
import Header from '../components/Header.jsx';
import { QUICK_ACCESS } from '../data/quickAccess.js';
import { usePersonero } from '../context/PersoneroContext.jsx';

export default function Home() {
  const navigate = useNavigate();
  const { perfil } = usePersonero();

  function go(item) {
    if (item.seed) {
      navigate('/chat', { state: { seed: item.seed } });
    } else {
      navigate(item.to);
    }
  }

  return (
    <>
      <Header title={perfil ? perfil.label.toUpperCase() : undefined} />
      <div className="screen">
        <h2 className="hero-question">¿En qué podemos ayudarte?</h2>
        <p className="muted">Elige un acceso rápido o abre el chat para escribir tu consulta.</p>

        <div className="section-title">Accesos rápidos</div>
        <div className="quick-grid">
          {QUICK_ACCESS.map((item) => (
            <button key={item.label} className="quick-card" onClick={() => go(item)}>
              <span className="quick-card__label">{item.label}</span>
            </button>
          ))}
        </div>

        <div className="section-title">Jornada electoral</div>
        <button className="btn btn--block btn--accent" onClick={() => navigate('/jornada')}>
          Modo Jornada Electoral — 4 de octubre de 2026
        </button>
      </div>
    </>
  );
}
