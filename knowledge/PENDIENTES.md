# Estado de la base normativa oficial en /knowledge

## Cargados con TEXTO OFICIAL completo (.txt + .json; el .pdf no se versiona)

| Documento | Archivo | Usado en la base local |
|---|---|---|
| Res. 0850-2025-JNE — Participación de personeros | `JNE/res-0850-2025-jne.txt` | acreditación, funciones, prohibiciones, tipos de personero |
| Res. 0837-2025-JNE — Actas observadas / con votos impugnados / con solicitud de nulidad | `JNE/res-0837-2025-jne.txt` | actas observadas, tipos de acta, 4 ejemplares, cotejo, apelación |
| Res. 0838-2025-JNE — Trámite de nulidad de votación y de elecciones | `JNE/res-0838-2025-jne.txt` | nulidad de mesa (constancia en acta + tasa + 3 días), apelación |
| Res. 0852-2025-JNE — Recuento de votos (arts. 1-20, texto completo) | `JNE/res-0852-2025-jne.txt` | recuento: audiencia pública, plazos, límites al personero |
| Res. 0844-2025-JNE — Propaganda electoral, publicidad estatal y neutralidad | `JNE/res-0844-2025-jne.txt` | propaganda día D (2 días / 24 h), publicidad estatal |
| Res. 0845-2025-JNE — Sanción de conductas prohibidas (art. 42 LOP) | `JNE/res-0845-2025-jne.txt` | entrega de dádivas / compra de votos, multa y exclusión |
| Res. 0834-2025-JNE — Encuestas y simulacros de votación | `JNE/res-0834-2025-jne.txt` | difusión de encuestas hasta el domingo anterior |
| Res. 0839-2025-JNE — Competencias del JNE en voto digital | `JNE/res-0839-2025-jne.txt` | voto digital (Ley 32270), mesa digital |
| Res. 0003-2026-JNE — Actualización del cronograma ERM 2026 | `JNE/res-0003-2026-jne.txt` | cronograma (marco), padrón se cierra 180 días antes |
| RENIEC R.J. D000023-2026-RENIEC/JNAC — DNI vencido | `OTROS/res-000023-2026-reniec.txt` | DNI caduco / de menor válido solo para votar el 4/10/2026 |
| **LOE — Ley N.° 26859** (extracto de artículos clave) | `LEYES/loe-26859-articulos-clave.txt` (+ PDF completo `loe-26859.pdf`) | arts. 7, 9, 240-241, 249, 261-263A, 266-270, 281-286, 301, 363-367, 382-386 |
| **Ley N.° 27683 — Elecciones Regionales** (texto completo) | `LEYES/ley-27683-elecciones-regionales.txt` | art. 5 (30 % + segunda elección), art. 8 (consejeros) |
| Cartilla de personeros ERM 2026 (ONPE) | `ONPE/cartilla-personeros-erm2026-rmpd.txt` | instalación, sufragio, escrutinio, impugnaciones, elector |
| **Cartilla de personeros ERM 2026, Tipo 1 (Municipal Provincial Distrital)** | `ONPE/cartilla-personeros-erm2026-tipo1-mpd.txt` | complemento de la cartilla Tipo 2 (R-M-P-D) |
| **Ley N.° 26864 — Elecciones Municipales** (texto completo) | `LEYES/ley-26864-elecciones-municipales.txt` | art. 23 (alcalde gana con mayoría simple, sin segunda vuelta municipal), art. 25 (cifra repartidora de regidores), arts. 6-20 (candidatos, tachas) |
| **LOE — Ley N.° 26859, texto completo** (antes solo el extracto de artículos clave) | `LEYES/loe-26859-completa.txt` | arts. 250-253 (multa 5% UIT por no integrar mesa, excusa/justificación), art. 240 (omisos residentes en el extranjero) |
| **Folleto ONPE "Miembro de mesa: ¿qué debes saber?"** | `ONPE/miembro-mesa.txt` | montos oficiales ERM 2026: compensación S/165, multa S/275, plazos de excusa (5 días hábiles) y justificación (5 días naturales) |
| **Banco de Preguntas y Respuestas para Personeros ERM 2026** (121 preguntas, documento de capacitación de organización política, no es norma oficial) | `OTROS/banco-preguntas-respuestas-personeros.txt` | reforzó reclamos/observaciones y buenas prácticas de fotografiado del acta; queda sin explotar la mayoría de las 121 preguntas (casos prácticos, coordinador distrital, prohibiciones, evaluación rápida) — ver "Pendiente de explotar" abajo |
| "Conoce tu cédula" (ONPE) | `ONPE/conoce-cedula.txt` | cómo marcar el voto, tipos de cédula |
| "ERM Generales" (ONPE, calendario) | `ONPE/erm2026-generales.txt` | ya cubierto por otras entradas |
| `ONPE/pasos-para-votar.pdf`, `ONPE/para-electores.pdf`, `ONPE/erm2026-folleto.pdf` | — | son infografías (imagen), `pdftotext` no extrae texto; revisar manualmente si se necesita algo puntual |

## Pendiente de explotar (2026-09-14)

El **Banco de Preguntas y Respuestas** (`OTROS/banco-preguntas-respuestas-personeros.txt`, 121 preguntas numeradas `PREGUNTA N`) solo se usó para reforzar 2 entradas existentes. Falta revisar y, si corresponde, convertir en nuevas entradas de `knowledge-base.json` las secciones: 3 (Coordinador distrital), 6 (impugnación de identidad en el sufragio), 9 (prohibiciones y delitos electorales), 10 (casos prácticos críticos) y el Anexo de protocolos rápidos al final del documento. Ojo: es un documento de capacitación interno de una organización política (cita Cartilla ONPE / LOE / Ley 26864 / Ley 27683 / Ley 28094 / Res. 0850 como fuentes), no una norma oficial — cualquier dato nuevo que no esté ya respaldado por una de esas normas debe marcarse `confianza: "yellow"`.

**Bug de emparejamiento corregido (2026-09-14):** las keywords de `fotos-acta` usaban "foto"/"fotos"/"fotografias" (variantes que `applySynonyms` en `localAnswer.js` reescribe a la forma canónica "fotografia" ANTES de comparar), por lo que ninguna coincidía y la pregunta cadía en la entrada equivocada (`actas-observadas`). Se reescribieron las keywords ya en forma canónica. **Quedan pendientes ~19 mismatches similares** (detectados corriendo cada keyword de la base contra el propio matcher) en: `tipos-personero`, `impugnacion-voto`, `prohibiciones`, `recuento-votos`, `seguridad`, `horario-jornada`, `quien-no-puede-ser-personero`, `elector-multa-no-votar`, `elector-trans-no-binario`, `miembros-mesa-quien-no-puede`, `personero-tecnico-funciones`, `candidato-incompatibilidades`, `observadores-electorales` — son preexistentes (confirmado que ya fallaban antes de la carga de hoy), producto de keywords ambiguas que se solapan entre entradas (p. ej. "candidato miembro de mesa" cae en `miembros-mesa-compensacion` por solape de vocabulario). Revisar en una próxima sesión con el mismo script de auto-test (cada keyword de cada entrada contra `findLocalAnswer`, comparar `matchId` esperado vs obtenido).

## Pendientes (prioridad media/baja)

| Documento | Para qué | Dónde buscar |
|---|---|---|
| **Anexo del cronograma** (Anexo de la Res. 0632-2025-JNE / 0003-2026-JNE) | Fechas exactas: cierre de padrón, inscripción de listas, tachas (no está en la publicación de El Peruano; se publica aparte en el portal del JNE) | portal.jne.gob.pe |
| **Res. 0849-2025-JNE** | Gestión de los JEE | gob.pe/institucion/jne/normas-legales |
| **Ley N.° 28094** (Organizaciones Políticas) | ROP, personeros legales, art. 42 (dádivas) | spij.minjus.gob.pe |
| **Reglamento ONPE de conformación de mesas de sufragio ERM 2026** (R.J. ~000083-2026-JN/ONPE) y **de la ODPE** | Composición 3+6, compensación (3 % UIT), multa (5 % UIT), excusas, coordinadores de local | onpe.gob.pe |
| **Protocolo ONPE** para electores trans y no binarios | Sufragio sin discriminación | onpe.gob.pe |
| **Manual de Capacitación Jurisdiccional Electoral ERM 2026 (JNE)** | Criterios de los JEE | jne.gob.pe |

## Cómo cargar un documento nuevo

1. `curl -A "<user-agent de navegador>" -L -o <id>.pdf "<url oficial>"` a la subcarpeta que corresponda.
2. `pdftotext -enc UTF-8 -nopgbrk <id>.pdf <id>.txt`
3. Crear el sidecar `<id>.json` (ver `knowledge/README.md`).
4. Ajustar `server/data/knowledge-base.json`: `base_normativa` y `fuente` con el artículo/página exactos y `confianza: "green"` cuando el texto quede verificado.
