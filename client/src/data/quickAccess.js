// Accesos rápidos de la pantalla principal.
// `to` es una ruta interna; `seed` (opcional) es la consulta que se abre en el chat.
export const QUICK_ACCESS = [
  { icon: '👤', label: 'Mis funciones', to: '/chat', seed: '¿Cuáles son mis funciones como personero según mi perfil?' },
  { icon: '⚖️', label: 'Mis derechos', to: '/chat', seed: '¿Cuáles son mis derechos como personero durante la jornada electoral?' },
  { icon: '📋', label: 'Actas', to: '/chat', seed: '¿Qué debo revisar en las actas electorales y qué copia me corresponde?' },
  { icon: '🗳️', label: 'Sufragio', to: '/chat', seed: '¿Qué debo observar durante el sufragio?' },
  { icon: '🔎', label: 'Escrutinio', to: '/chat', seed: '¿Cómo se desarrolla el escrutinio y qué puedo hacer como personero?' },
  { icon: '🚨', label: '¿Qué hago si...?', to: '/que-hago-si' },
  { icon: '📚', label: 'Normativa', to: '/normativa' },
  { icon: '📝', label: 'Reportar incidencia', to: '/incidencias?form=1' },
];
