import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Header from '../components/Header.jsx';
import IncidentForm, { loadLocalIncidents } from '../components/IncidentForm.jsx';
import { listIncidents } from '../api/client.js';
import { CATEGORIA_LABEL } from '../data/categorias.js';

export default function Incidents() {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const showForm = params.get('form') === '1';
  const [items, setItems] = useState([]);
  const [source, setSource] = useState('local');

  async function refresh() {
    try {
      const res = await listIncidents();
      setItems(res.items || []);
      setSource('servidor');
    } catch {
      setItems(loadLocalIncidents());
      setSource('local');
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  return (
    <>
      <Header title="INCIDENCIAS" subtitle="Registro de incidencias del proceso" showBack />
      <div className="screen">
        {!showForm && (
          <button
            className="btn btn--block btn--accent"
            style={{ marginTop: 14 }}
            onClick={() => setParams({ form: '1' })}
          >
            Reportar incidencia
          </button>
        )}

        {showForm ? (
          <>
            <div className="section-title">Reportar incidencia</div>
            <IncidentForm onSaved={refresh} />
            <button
              className="btn btn--block btn--ghost"
              style={{ marginTop: 12 }}
              onClick={() => navigate('/incidencias')}
            >
              Ver incidencias registradas
            </button>
          </>
        ) : (
          <>
            <div className="section-title">Registradas ({source})</div>
            {items.length === 0 ? (
              <p className="center-hint">Aún no hay incidencias registradas.</p>
            ) : (
              items.map((it) => (
                <div key={it.id} className="incident-item">
                  <div className="incident-item__head">
                    <span>{CATEGORIA_LABEL[it.categoria] || it.categoria || 'Sin categoría'}</span>
                    <span>{(it.fecha || '') + ' ' + (it.hora || '')}</span>
                  </div>
                  <div className="muted" style={{ marginTop: 4 }}>
                    {it.local_votacion || 'Local s/d'} · Mesa {it.mesa_sufragio || 's/d'}
                  </div>
                  <div style={{ marginTop: 6 }}>{it.descripcion}</div>
                </div>
              ))
            )}
          </>
        )}
      </div>
    </>
  );
}
