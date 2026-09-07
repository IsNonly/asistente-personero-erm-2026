import { useNavigate } from 'react-router-dom';
import Header from '../components/Header.jsx';
import { QUE_HAGO_SI } from '../data/queHagoSi.js';

export default function QueHagoSi() {
  const navigate = useNavigate();

  return (
    <>
      <Header title="¿QUÉ HAGO SI...?" subtitle="Orientación práctica inmediata" showBack />
      <div className="screen">
        <p className="muted" style={{ marginTop: 12 }}>
          Selecciona una situación. Se abrirá el chat con la consulta lista para responder.
        </p>

        <div className="option-list" style={{ marginTop: 16 }}>
          {QUE_HAGO_SI.map((opt) => (
            <button
              key={opt.label}
              className="option-item"
              onClick={() => navigate('/chat', { state: { seed: opt.seed } })}
            >
              <span className="option-item__icon" aria-hidden="true">{opt.icon}</span>
              <span>{opt.label}</span>
              <span className="option-item__chevron" aria-hidden="true">›</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
