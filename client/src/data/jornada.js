// Modo Jornada Electoral — accesos grandes y rápidos para el día de la elección.
export const JORNADA_FECHA = '4 de octubre de 2026';

export const JORNADA_ITEMS = [
  { icon: '🟢', label: 'Instalación', seed: '¿Qué debo verificar y hacer durante la instalación de la mesa?' },
  { icon: '🔵', label: 'Sufragio', seed: '¿Qué debo observar durante el sufragio?' },
  { icon: '🟡', label: 'Escrutinio', seed: '¿Qué debo verificar durante el escrutinio?' },
  { icon: '🟠', label: 'Actas', seed: '¿Qué debo revisar en las actas y qué copia me corresponde?' },
  { icon: '🔴', label: 'Incidente', seed: 'Ocurrió un incidente en la mesa. ¿Cómo procedo paso a paso?' },
  { icon: '⚖️', label: 'Impugnación', seed: '¿Cómo se tramita una impugnación y cuál es mi rol como personero?' },
  { icon: '🚨', label: 'Reportar incidencia', to: '/incidencias?form=1' },
];
