// Acceso mínimo a Supabase por su API REST (PostgREST), sin dependencias.
// Se usa solo desde el servidor con la service_role key: nunca se envía al
// navegador ni se sube al repositorio (va en variables de entorno).

const URL_BASE = (process.env.SUPABASE_URL || '').replace(/\/+$/, '').replace(/\/rest\/v1$/, '');
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export function isSupabaseEnabled() {
  return Boolean(URL_BASE && KEY);
}

export async function supabaseRequest(path, { method = 'GET', body, prefer } = {}) {
  const res = await fetch(`${URL_BASE}/rest/v1/${path}`, {
    method,
    headers: {
      apikey: KEY,
      Authorization: `Bearer ${KEY}`,
      'Content-Type': 'application/json',
      ...(prefer ? { Prefer: prefer } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) {
    throw new Error(`Supabase ${res.status}: ${data?.message || text}`);
  }
  return data;
}
