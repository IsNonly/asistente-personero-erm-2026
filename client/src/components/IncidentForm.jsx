import { useState } from 'react';
import { usePersonero } from '../context/PersoneroContext.jsx';
import { PERSONEROS } from '../data/personeros.js';
import { CATEGORIAS, CATEGORIA_LABEL } from '../data/categorias.js';
import { createIncident } from '../api/client.js';

const LOCAL_KEY = 'incidencias_locales';

function loadLocal() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveLocal(list) {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(list));
  } catch {
    /* almacenamiento no disponible */
  }
}

const EMPTY = {
  tipo_personero: '',
  local_votacion: '',
  mesa_sufragio: '',
  fecha: '',
  hora: '',
  categoria: '',
  descripcion: '',
  evidencia: '',
};

export default function IncidentForm({ onSaved }) {
  const { perfil } = usePersonero();
  const [form, setForm] = useState({ ...EMPTY, tipo_personero: perfil?.id || '' });
  const [status, setStatus] = useState(null); // null | 'saving' | 'ok' | 'error'
  const [savedWhere, setSavedWhere] = useState('');

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.descripcion.trim()) {
      setStatus('error');
      return;
    }
    setStatus('saving');

    const record = {
      ...form,
      id: `inc_${Date.now()}`,
      creado_en: new Date().toISOString(),
    };

    try {
      const res = await createIncident(record);
      setSavedWhere(res?.storage === 'database' ? 'base de datos' : 'servidor');
    } catch {
      // Sin servidor / sin BD: se guarda en el navegador.
      const list = loadLocal();
      list.unshift({ ...record, _local: true });
      saveLocal(list);
      setSavedWhere('este dispositivo (local)');
    }

    setStatus('ok');
    setForm({ ...EMPTY, tipo_personero: perfil?.id || '' });
    onSaved?.();
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-note">
        Los datos se guardan de forma local o en la base de datos del proyecto. La
        arquitectura permitirá incorporar autenticación y almacenamiento seguro más adelante.
      </div>

      {status === 'ok' && (
        <div className="form-success">
          ✅ Incidencia registrada en {savedWhere}.
        </div>
      )}
      {status === 'error' && (
        <div className="form-note">La descripción de la incidencia es obligatoria.</div>
      )}

      <div className="form-field">
        <label htmlFor="tp">Tipo de personero</label>
        <select id="tp" value={form.tipo_personero} onChange={(e) => update('tipo_personero', e.target.value)}>
          <option value="">Selecciona…</option>
          {PERSONEROS.map((p) => (
            <option key={p.id} value={p.id}>{p.label}</option>
          ))}
        </select>
      </div>

      <div className="form-field">
        <label htmlFor="lv">Local de votación</label>
        <input id="lv" value={form.local_votacion} onChange={(e) => update('local_votacion', e.target.value)} placeholder="Nombre o código del local" />
      </div>

      <div className="form-field">
        <label htmlFor="ms">Mesa de sufragio</label>
        <input id="ms" value={form.mesa_sufragio} onChange={(e) => update('mesa_sufragio', e.target.value)} placeholder="N.° de mesa" inputMode="numeric" />
      </div>

      <div className="form-field">
        <label htmlFor="fe">Fecha</label>
        <input id="fe" type="date" value={form.fecha} onChange={(e) => update('fecha', e.target.value)} />
      </div>

      <div className="form-field">
        <label htmlFor="ho">Hora</label>
        <input id="ho" type="time" value={form.hora} onChange={(e) => update('hora', e.target.value)} />
      </div>

      <div className="form-field">
        <label htmlFor="ca">Categoría</label>
        <select id="ca" value={form.categoria} onChange={(e) => update('categoria', e.target.value)}>
          <option value="">Selecciona…</option>
          {CATEGORIAS.map((c) => (
            <option key={c} value={c}>{CATEGORIA_LABEL[c] || c}</option>
          ))}
        </select>
      </div>

      <div className="form-field">
        <label htmlFor="de">Descripción</label>
        <textarea id="de" rows={4} value={form.descripcion} onChange={(e) => update('descripcion', e.target.value)} placeholder="Describe qué ocurrió, quiénes participaron y dónde." />
      </div>

      <div className="form-field">
        <label htmlFor="ev">Evidencia / fotografía</label>
        <input id="ev" type="file" accept="image/*" onChange={(e) => update('evidencia', e.target.files?.[0]?.name || '')} />
        <div className="muted" style={{ marginTop: 6 }}>
          En esta etapa se registra solo el nombre del archivo. La subida segura de evidencias se implementará con el almacenamiento definitivo.
        </div>
      </div>

      <button type="submit" className="btn btn--block btn--accent" disabled={status === 'saving'}>
        {status === 'saving' ? 'Guardando…' : 'REPORTAR INCIDENCIA'}
      </button>
    </form>
  );
}

export { loadLocal as loadLocalIncidents };
