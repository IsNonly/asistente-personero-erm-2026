-- ==========================================================
-- Tabla de registro de personeros para Supabase.
-- Pegar una sola vez en Supabase → SQL Editor → Run.
-- ==========================================================
CREATE TABLE IF NOT EXISTS public.registros (
  id              BIGSERIAL PRIMARY KEY,
  nombre          TEXT NOT NULL,
  celular         TEXT NOT NULL UNIQUE,           -- 9 dígitos, sin +51
  perfil          TEXT,                           -- personero_mesa | personero_local | coordinador_zonal | coordinador_distrital
  creado_en       TIMESTAMPTZ DEFAULT now(),
  actualizado_en  TIMESTAMPTZ DEFAULT now()
);

-- Datos personales: RLS activado y SIN políticas, así la clave pública (anon)
-- no puede leer ni escribir. Solo el servidor, con la service_role key, accede.
ALTER TABLE public.registros ENABLE ROW LEVEL SECURITY;

-- Refresca la caché de la API para que la tabla quede disponible de inmediato.
NOTIFY pgrst, 'reload schema';
