-- ==========================================================
-- ASISTENTE DEL PERSONERO — ERM 2026
-- Esquema inicial de base de datos (PostgreSQL)
--
-- Uso:
--   psql "$DATABASE_URL" -f database/schema.sql
--
-- Nota sobre embeddings:
--   Este esquema guarda el embedding como JSONB para no exigir la
--   extensión pgvector en la etapa 1. Cuando integres RAG con búsqueda
--   vectorial, instala pgvector y migra la columna:
--     CREATE EXTENSION IF NOT EXISTS vector;
--     ALTER TABLE document_chunks
--       ALTER COLUMN embedding TYPE vector(1536) USING NULL;
-- ==========================================================

-- ---------- Documentos normativos ----------
CREATE TABLE IF NOT EXISTS documents (
  id                TEXT PRIMARY KEY,
  entidad           TEXT NOT NULL,              -- JNE, ONPE, Congreso, etc.
  tipo_documento    TEXT,                       -- Resolución, Ley, Cartilla, Manual
  numero            TEXT,
  titulo            TEXT NOT NULL,
  fecha_publicacion DATE,
  fecha_vigencia    DATE,
  estado            TEXT DEFAULT 'pendiente',   -- pendiente | vigente | derogada
  version           TEXT DEFAULT '1',
  proceso           TEXT DEFAULT 'ERM 2026',
  url_oficial       TEXT,
  prioridad         INTEGER DEFAULT 5,
  archivo_path      TEXT,                       -- ruta relativa en /knowledge
  creado_en         TIMESTAMPTZ DEFAULT now()
);

-- ---------- Fragmentos (chunks) para RAG ----------
CREATE TABLE IF NOT EXISTS document_chunks (
  id           BIGSERIAL PRIMARY KEY,
  document_id  TEXT NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  chunk_index  INTEGER NOT NULL,
  contenido    TEXT NOT NULL,
  seccion      TEXT,
  articulo     TEXT,
  pagina       INTEGER,
  tokens       INTEGER,
  embedding    JSONB,                           -- ver nota sobre pgvector arriba
  creado_en    TIMESTAMPTZ DEFAULT now(),
  UNIQUE (document_id, chunk_index)
);
CREATE INDEX IF NOT EXISTS idx_chunks_document ON document_chunks(document_id);

-- ---------- Consultas al asistente (historial) ----------
CREATE TABLE IF NOT EXISTS questions (
  id             BIGSERIAL PRIMARY KEY,
  session_id     TEXT,
  perfil         TEXT,                          -- personero_mesa | personero_local | coordinador_zonal | coordinador_distrital
  pregunta       TEXT NOT NULL,
  clasificacion  TEXT,
  respuesta      TEXT,
  confianza      TEXT,                          -- green | yellow | red
  fuentes_count  INTEGER DEFAULT 0,
  creado_en      TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_questions_session ON questions(session_id);

-- ---------- Incidencias reportadas ----------
CREATE TABLE IF NOT EXISTS incidents (
  id              BIGSERIAL PRIMARY KEY,
  session_id      TEXT,
  tipo_personero  TEXT,
  local_votacion  TEXT,
  mesa_sufragio   TEXT,
  fecha           DATE,
  hora            TEXT,
  categoria       TEXT,
  descripcion     TEXT NOT NULL,
  evidencia       TEXT,                          -- nombre/ruta del archivo (subida segura: futuro)
  estado          TEXT DEFAULT 'registrada',
  creado_en       TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_incidents_categoria ON incidents(categoria);

-- ---------- Sesiones ----------
CREATE TABLE IF NOT EXISTS sessions (
  id          TEXT PRIMARY KEY,
  perfil      TEXT,
  user_id     BIGINT,
  user_agent  TEXT,
  creado_en   TIMESTAMPTZ DEFAULT now(),
  visto_en    TIMESTAMPTZ DEFAULT now()
);

-- ---------- Usuarios (autenticación: preparado para el futuro) ----------
CREATE TABLE IF NOT EXISTS users (
  id             BIGSERIAL PRIMARY KEY,
  nombre         TEXT,
  email          TEXT UNIQUE,
  password_hash  TEXT,                           -- se completará al habilitar autenticación
  rol            TEXT DEFAULT 'personero',
  perfil         TEXT,
  organizacion   TEXT,
  activo         BOOLEAN DEFAULT true,
  creado_en      TIMESTAMPTZ DEFAULT now()
);
