import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { PERSONEROS } from '../data/personeros.js';
import { registrarPersonero } from '../api/client.js';

const STORAGE_KEY = 'personero_perfil';
// El registro (nombre + celular) va en localStorage para que no se vuelva a
// pedir en ese dispositivo, aunque se cierre el navegador.
const REGISTRO_KEY = 'personero_registro';
const PersoneroContext = createContext(null);

function readRegistro() {
  try {
    const raw = localStorage.getItem(REGISTRO_KEY);
    const r = raw ? JSON.parse(raw) : null;
    return r && r.nombre && r.celular ? r : null;
  } catch {
    return null;
  }
}

function writeRegistro(r) {
  try {
    if (r) localStorage.setItem(REGISTRO_KEY, JSON.stringify(r));
    else localStorage.removeItem(REGISTRO_KEY);
  } catch {
    /* almacenamiento no disponible: el registro vive solo en memoria */
  }
}

export function PersoneroProvider({ children }) {
  const [perfilId, setPerfilId] = useState(() => {
    try {
      return sessionStorage.getItem(STORAGE_KEY) || null;
    } catch {
      return null;
    }
  });
  const [registro, setRegistroState] = useState(readRegistro);

  useEffect(() => {
    try {
      if (perfilId) sessionStorage.setItem(STORAGE_KEY, perfilId);
      else sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      /* almacenamiento no disponible: el perfil vive solo en memoria */
    }
  }, [perfilId]);

  // Envía el registro al servidor. Si falla (sin señal, servidor caído), queda
  // marcado como pendiente y se reintenta la próxima vez que se abra la app.
  const sync = useCallback(async (r) => {
    try {
      await registrarPersonero(r);
      const ok = { ...r, sincronizado: true };
      writeRegistro(ok);
      setRegistroState(ok);
    } catch {
      /* se reintenta en la próxima apertura */
    }
  }, []);

  useEffect(() => {
    if (registro && !registro.sincronizado) sync(registro);
    // solo al abrir la app
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo(() => {
    const perfil = PERSONEROS.find((p) => p.id === perfilId) || null;
    return {
      perfil,
      perfilId,
      registro,
      setRegistro: ({ nombre, celular }) => {
        const r = { nombre, celular, perfil: perfilId, registrado_en: new Date().toISOString(), sincronizado: false };
        writeRegistro(r);
        setRegistroState(r);
        sync(r);
      },
      setPerfil: (id) => {
        setPerfilId(id);
        // Guarda también el rol elegido junto al registro.
        if (registro && registro.perfil !== id) {
          const r = { ...registro, perfil: id, sincronizado: false };
          writeRegistro(r);
          setRegistroState(r);
          sync(r);
        }
      },
      clearPerfil: () => setPerfilId(null),
      isRegistered: Boolean(registro),
      isReady: Boolean(perfil),
    };
  }, [perfilId, registro, sync]);

  return <PersoneroContext.Provider value={value}>{children}</PersoneroContext.Provider>;
}

export function usePersonero() {
  const ctx = useContext(PersoneroContext);
  if (!ctx) throw new Error('usePersonero debe usarse dentro de <PersoneroProvider>');
  return ctx;
}
