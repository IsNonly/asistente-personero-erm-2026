import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { PERSONEROS } from '../data/personeros.js';

const STORAGE_KEY = 'personero_perfil';
const PersoneroContext = createContext(null);

export function PersoneroProvider({ children }) {
  const [perfilId, setPerfilId] = useState(() => {
    try {
      return sessionStorage.getItem(STORAGE_KEY) || null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    try {
      if (perfilId) sessionStorage.setItem(STORAGE_KEY, perfilId);
      else sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      /* almacenamiento no disponible: el perfil vive solo en memoria */
    }
  }, [perfilId]);

  const value = useMemo(() => {
    const perfil = PERSONEROS.find((p) => p.id === perfilId) || null;
    return {
      perfil,
      perfilId,
      setPerfil: (id) => setPerfilId(id),
      clearPerfil: () => setPerfilId(null),
      isReady: Boolean(perfil),
    };
  }, [perfilId]);

  return <PersoneroContext.Provider value={value}>{children}</PersoneroContext.Provider>;
}

export function usePersonero() {
  const ctx = useContext(PersoneroContext);
  if (!ctx) throw new Error('usePersonero debe usarse dentro de <PersoneroProvider>');
  return ctx;
}
