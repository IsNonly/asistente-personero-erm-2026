import { useNavigate } from 'react-router-dom';
import Header from '../components/Header.jsx';
import { JORNADA_ITEMS, JORNADA_FECHA } from '../data/jornada.js';

export default function ModoJornada() {
  const navigate = useNavigate();

  return (
    <>
      <Header title="MODO JORNADA ELECTORAL" subtitle={JORNADA_FECHA} showBack />
      <div className="screen">
        <p className="muted" style={{ marginTop: 12 }}>
          Accesos directos para usar durante la jornada. Toca una etapa para abrir la guía.
        </p>

        <div className="option-list" style={{ marginTop: 16 }}>
          {JORNADA_ITEMS.map((item) => (
            <button
              key={item.label}
              className="option-item"
              onClick={() =>
                item.to
                  ? navigate(item.to)
                  : navigate('/chat', { state: { seed: item.seed } })
              }
            >
              <span>{item.label}</span>
              <span className="option-item__chevron" aria-hidden="true">›</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
