# Asistente del Personero — ERM 2026

**Asistente virtual para Personeros Electorales** · Elecciones Regionales y Municipales del Perú 2026.

Aplicación **mobile-first** (Android, iPhone, tablet y computadora) que orienta a los
personeros sobre funciones, derechos, deberes, acreditación, sufragio, escrutinio,
actas, votos impugnados, actas observadas, nulidad, recuento, propaganda, neutralidad
e incidencias.

> Herramienta **neutral**: sin candidatos, sin partidos, sin propaganda. El asistente
> **no inventa** normativa; cuando no hay fuente oficial suficiente lo indica
> explícitamente.

> **Funciona sin API de IA.** El chat responde desde una **base local de ~28 respuestas
> con fuente oficial** (Reglamento de personeros Res. 0850-2025-JNE y Cartilla de
> instrucciones para personeros ERM 2026 — ONPE). Si activas una clave de IA, las
> consultas no cubiertas por la base local pasan a Claude + RAG.

Proyecto **independiente y nuevo**. No modifica ni reutiliza ningún otro proyecto.

---

## Contenido

- [Arquitectura](#arquitectura)
- [Requisitos](#requisitos)
- [Cómo ejecutar](#cómo-ejecutar)
- [Variables de entorno](#variables-de-entorno)
- [Cómo conectar la IA](#cómo-conectar-la-ia)
- [Cómo cargar documentos](#cómo-cargar-documentos)
- [Base de datos](#base-de-datos)
- [Cómo continuar con RAG](#cómo-continuar-con-rag)
- [Despliegue en GitHub + Vercel](#despliegue-en-github--vercel)
- [Estado de la Etapa 1](#estado-de-la-etapa-1)

---

## Arquitectura

```
/client        Frontend React + Vite (mobile-first)
  /src
    /components  Header, Chat, MessageBubble, PersoneroSelector, QuickQuestions,
                 SourceCard, IncidentForm, NormCard, BottomNavigation
    /pages       Home, Chat, Incidents, Normativa, Profile (+ QueHagoSi, ModoJornada)
    /context     PersoneroContext (perfil de la sesión)
    /data        Textos y metadatos de la interfaz
    /api         Cliente HTTP hacia el backend

/api           api/index.js — entrada serverless para Vercel (reexporta la app Express)

/server        Backend Node + Express
  app.js         app Express (reutilizable: local y serverless)
  index.js       arranque del servidor local (app.listen)
  /routes        chat, incidents, documents
  /services      ai (Claude), rag, classifier, embeddings, localAnswer
  /data          knowledge-base.json (respuestas locales con fuente oficial)
  /prompts       personero-master.js / .txt

/knowledge     Documentos oficiales (JNE / ONPE / LEYES / OTROS)
/database      schema.sql (PostgreSQL)
/scripts       ingest.js, embeddings.js
```

Flujo de una consulta:

```
Pregunta → Clasificación → ¿Coincide con la base local? ── sí ─→ Respuesta + Fuente oficial
                                     │ no
                                     ▼
                        ¿Hay clave de IA?  ── sí ─→ RAG + Claude → Respuesta + Fuente
                                     │ no
                                     ▼
                 "No encuentro fundamento oficial suficiente…" (nivel "red")
```

- **Base local**: `server/data/knowledge-base.json` + `server/services/localAnswer.js`
  (coincidencia por palabras clave, sin IA).
- **RAG (futuro)**: `server/services/rag.js` + `/knowledge` + embeddings.

---

## Requisitos

- **Node.js 20+** (se usa `node --watch`)
- **PostgreSQL 14+** — opcional en la Etapa 1 (sin BD, las incidencias se guardan en el navegador)
- Una **clave de API de Anthropic** — opcional; sin ella el chat responde
  *"Servicio de IA pendiente de configuración."*

---

## Cómo ejecutar

```bash
# 1. Instalar dependencias (raíz + client + server)
npm run install:all

# 2. Configurar variables de entorno
cp .env.example .env
cp client/.env.example client/.env
cp server/.env.example server/.env   # si no existe, crea server/.env con las
                                     # variables PORT, ANTHROPIC_API_KEY, DATABASE_URL

# 3. Levantar cliente + servidor a la vez
npm run dev
```

- Cliente: <http://localhost:5173>
- Servidor: <http://localhost:4000> (salud: `GET /api/health`)

El cliente hace proxy de `/api` hacia el servidor, así que **funciona aunque el
servidor esté apagado**: el chat mostrará el mensaje temporal de servicio pendiente.

Para ejecutarlos por separado:

```bash
npm run dev:client
npm run dev:server
```

Build de producción del cliente:

```bash
npm run build       # genera client/dist
```

---

## Variables de entorno

Definidas en `.env.example` (raíz) y `client/.env.example`.

| Variable | Dónde | Descripción |
|---|---|---|
| `PORT` | server | Puerto del backend (por defecto `4000`) |
| `ANTHROPIC_API_KEY` | server | Clave de Anthropic. **Nunca en el frontend.** Vacía = IA pendiente. |
| `ANTHROPIC_MODEL` | server | Modelo de Claude (por defecto `claude-sonnet-5`) |
| `DATABASE_URL` | server | Cadena de conexión PostgreSQL. Vacía = modo local sin BD. |
| `VITE_API_URL` | client | Base de la API (deja `/api` para el proxy de desarrollo) |

> Las claves y secretos **solo** viven en `server/.env`, que está en `.gitignore`.
> El frontend nunca recibe la clave de IA: todas las llamadas pasan por el backend.

---

## Cómo conectar la IA

1. Obtén una clave de API de Anthropic.
2. En `server/.env`:
   ```
   ANTHROPIC_API_KEY=tu_clave
   ANTHROPIC_MODEL=claude-sonnet-5
   ```
3. Reinicia el servidor. `GET /api/health` debe devolver `"ai": true`.

El prompt maestro del asistente está en `server/prompts/personero-master.txt`
e incluye la **regla de no inventar** y el **formato de respuesta**
(Respuesta · Base normativa · Fuente · Qué puedes hacer ·
Qué no debes hacer · Si ocurre una incidencia).

Con o sin IA, si la consulta coincide con la **base local** (`server/data/knowledge-base.json`)
el asistente responde desde ahí, citando la norma. Para consultas fuera de esa base:
con IA → responde Claude; sin IA → nivel "red" y remite al JNE/ONPE.

### Ampliar la base local

Edita `server/data/knowledge-base.json`. Cada entrada tiene `keywords` (frases para
el emparejamiento), `respuesta`, `base_normativa`, `fuente`, `puedes`, `no_debes`,
`incidencia` y `confianza` (`green` / `yellow` / `red`). No requiere reiniciar el
build del cliente; solo reinicia el servidor.

---

## Cómo cargar documentos

1. Coloca los PDF/te­xtos oficiales en `knowledge/JNE`, `knowledge/ONPE`,
   `knowledge/LEYES` o `knowledge/OTROS`, cada uno con su sidecar `.json` de
   metadatos (ver `knowledge/README.md`).
2. Ejecuta la ingesta:
   ```bash
   npm run ingest
   ```
   Carga los documentos en la tabla `documents` y crea los `document_chunks`.
   (En la Etapa 1 procesa `.txt` / `.md`; para `.pdf` añade un parser como `pdf-parse`.)
3. Genera embeddings cuando el servicio esté configurado:
   ```bash
   npm run embeddings
   ```

Metadatos por documento: `id, entidad, tipo_documento, numero, titulo,
fecha_publicacion, fecha_vigencia, estado, version, proceso, url_oficial, prioridad`.

---

## Base de datos

```bash
# Crea la base y aplica el esquema
createdb asistente_personero
psql "$DATABASE_URL" -f database/schema.sql
# o:
npm run db:schema
```

Tablas iniciales: `documents`, `document_chunks`, `questions`, `incidents`,
`sessions`, `users`.

La columna `document_chunks.embedding` es `JSONB` en la Etapa 1. Para búsqueda
vectorial instala **pgvector** y migra la columna (instrucciones dentro de
`database/schema.sql`).

Sin `DATABASE_URL`, el backend funciona igual: las incidencias se guardan en
memoria del servidor y en `localStorage` del navegador.

---

## Cómo continuar con RAG

La arquitectura ya está preparada:

1. **Ingesta** — `scripts/ingest.js` (hecho: chunking + carga).
2. **Embeddings** — implementa `embed()` en `server/services/embeddings.js`
   con el proveedor que elijas y pon `EMBEDDINGS_ENABLED = true`; luego
   `npm run embeddings`.
3. **Recuperación** — completa `retrieve()` en `server/services/rag.js`:
   embedding de la consulta → vecinos más cercanos en `document_chunks`
   (pgvector) → devolver fragmentos con su referencia (documento, artículo, página).
4. **Generación** — `server/services/ai.js` ya inyecta el contexto recuperado en
   el prompt y ajusta el nivel de confianza (green/yellow/red) según haya o no fuentes.

No hace falta tocar el frontend: `MessageBubble` ya renderiza la clasificación,
la tarjeta de **Fuente** y el **nivel de confianza**.

---

## Despliegue en GitHub + Vercel

### 1. Subir a GitHub

```bash
git init
git add .
git commit -m "Asistente del Personero ERM 2026 — Etapa 1"
git branch -M main
# crea el repo en https://github.com/new  (ej. asistente-personero-erm-2026)
git remote add origin https://github.com/<tu-usuario>/asistente-personero-erm-2026.git
git push -u origin main
```

> `.gitignore` ya excluye `node_modules`, `.env` y los PDF de `/knowledge`.
> Los textos extraídos (`.txt`) y `server/data/knowledge-base.json` **sí** se versionan,
> por lo que el asistente funciona en producción sin subir binarios.

### 2. Desplegar en Vercel

El repo ya trae `vercel.json` y `api/index.js` (la API Express corre como
**función serverless**; el cliente Vite se sirve como estático).

**Opción A — Panel web:**
1. En <https://vercel.com/new> importa el repositorio.
2. Framework preset: **Other**. No cambies Build Command ni Output (los toma de `vercel.json`).
3. *(Opcional)* En **Settings → Environment Variables** agrega:
   - `ANTHROPIC_API_KEY` y `ANTHROPIC_MODEL` — para habilitar la IA.
   - `DATABASE_URL` — para guardar incidencias y consultas (Vercel Postgres / Neon).
4. **Deploy**. Tu app queda en `https://<proyecto>.vercel.app`.

**Opción B — CLI:**
```bash
npm i -g vercel
vercel          # primer deploy (preview)
vercel --prod   # producción
```

### Consideraciones en serverless

| Tema | Comportamiento |
|---|---|
| Chat (base local) | Funciona igual, sin configuración. |
| IA (Claude) | Solo si defines `ANTHROPIC_API_KEY` en Vercel. |
| Incidencias **sin** `DATABASE_URL` | No persisten entre invocaciones (cada request puede ser otra instancia). El cliente igual las guarda en `localStorage`. Para persistencia real, añade una base PostgreSQL y ejecuta `database/schema.sql`. |
| `/knowledge` (RAG) | La ingesta y los embeddings se ejecutan como scripts locales/CI, no en la función. |

## Estado de la Etapa 1

- [x] Proyecto nuevo e independiente
- [x] Interfaz principal mobile-first
- [x] Header con identidad propia (Asistente del Personero · ERM 2026)
- [x] Selector de tipo de personero (4 perfiles) con persistencia de sesión
- [x] Chat con mensaje inicial, burbujas y barra inferior de escritura
- [x] Preguntas rápidas con scroll horizontal
- [x] Navegación inferior (Inicio · Preguntar · Incidencias · Normativa · Mi perfil)
- [x] Módulo "¿Qué hago si...?" que abre el chat con la consulta
- [x] Módulo de Normativa (tarjetas con metadatos, sin contenido inventado)
- [x] Formulario de "Reportar incidencia" (guardado local / BD)
- [x] Modo Jornada Electoral
- [x] Diseño responsive (Android, iPhone, tablet, computadora)
- [x] Chat funcional **sin API de IA** (base local con ~28 respuestas y fuente oficial)
- [x] Estructura preparada para IA (prompt maestro, clasificador, perfiles)
- [x] Estructura preparada para RAG (`/knowledge`, `rag.js`, `embeddings.js`, chunks)
- [x] Base de datos preparada (`database/schema.sql`)
- [x] `.env.example` y este `README.md`
