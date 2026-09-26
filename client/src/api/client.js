const BASE = import.meta.env.VITE_API_URL || '/api';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`API ${res.status}: ${detail || res.statusText}`);
  }
  return res.json();
}

/**
 * Envía una consulta al asistente.
 * Si el servidor no está disponible o la IA no está configurada,
 * el llamador recibe un objeto con `pending: true`.
 */
export async function sendChat({ message, perfil, history }) {
  try {
    return await request('/chat', {
      method: 'POST',
      body: JSON.stringify({ message, perfil, history }),
    });
  } catch (err) {
    return {
      answer:
        'Servicio de IA pendiente de configuración.\n\n' +
        'No se pudo contactar al servidor del asistente. ' +
        'Cuando la IA y la base normativa estén configuradas, aquí verás la respuesta con su fundamento oficial.',
      confidence: 'red',
      classification: 'otros',
      pending: true,
      error: err.message,
    };
  }
}

export async function createIncident(payload) {
  return request('/incidents', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function listIncidents() {
  return request('/incidents', { method: 'GET' });
}

export async function registrarPersonero({ nombre, celular, perfil }) {
  return request('/registros', {
    method: 'POST',
    body: JSON.stringify({ nombre, celular, perfil }),
  });
}
