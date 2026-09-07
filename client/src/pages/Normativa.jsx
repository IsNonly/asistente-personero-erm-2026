import { useState } from 'react';
import Header from '../components/Header.jsx';
import NormCard from '../components/NormCard.jsx';
import { NORMATIVA, NORM_TABS } from '../data/normativa.js';

export default function Normativa() {
  const [tab, setTab] = useState(NORM_TABS[0]);
  const list = NORMATIVA.filter((n) => n.categoria === tab);

  return (
    <>
      <Header title="NORMATIVA ELECTORAL" subtitle="Fuentes oficiales JNE · ONPE · Leyes" showBack />
      <div className="screen">
        <p className="muted" style={{ marginTop: 12 }}>
          Estas tarjetas listan la normativa de referencia. El contenido no se inventa: los
          documentos oficiales (PDF) se cargarán y vincularán aquí.
        </p>

        <div className="tabs" style={{ marginTop: 14 }}>
          {NORM_TABS.map((t) => (
            <button
              key={t}
              className={`tab ${tab === t ? 'is-active' : ''}`}
              onClick={() => setTab(t)}
            >
              {t}
            </button>
          ))}
        </div>

        <div style={{ marginTop: 16 }}>
          {list.length === 0 ? (
            <p className="center-hint">Sin documentos en esta categoría todavía.</p>
          ) : (
            list.map((n) => <NormCard key={n.id} norm={n} />)
          )}
        </div>
      </div>
    </>
  );
}
