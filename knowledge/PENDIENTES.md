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

## Pendientes (prioridad media/baja)

| Documento | Para qué | Dónde buscar |
|---|---|---|
| **Anexo del cronograma** (Anexo de la Res. 0632-2025-JNE / 0003-2026-JNE) | Fechas exactas: cierre de padrón, inscripción de listas, tachas (no está en la publicación de El Peruano; se publica aparte en el portal del JNE) | portal.jne.gob.pe |
| **Res. 0849-2025-JNE** | Gestión de los JEE | gob.pe/institucion/jne/normas-legales |
| **Ley N.° 26864** (Elecciones Municipales) | Art. 36: nulidad de elecciones municipales | spij.minjus.gob.pe |
| **Ley N.° 28094** (Organizaciones Políticas) | ROP, personeros legales, art. 42 (dádivas) | spij.minjus.gob.pe |
| **Reglamento ONPE de conformación de mesas de sufragio ERM 2026** (R.J. ~000083-2026-JN/ONPE) y **de la ODPE** | Composición 3+6, compensación (3 % UIT), multa (5 % UIT), excusas, coordinadores de local | onpe.gob.pe |
| **Protocolo ONPE** para electores trans y no binarios | Sufragio sin discriminación | onpe.gob.pe |
| **Manual de Capacitación Jurisdiccional Electoral ERM 2026 (JNE)** | Criterios de los JEE | jne.gob.pe |

## Cómo cargar un documento nuevo

1. `curl -A "<user-agent de navegador>" -L -o <id>.pdf "<url oficial>"` a la subcarpeta que corresponda.
2. `pdftotext -enc UTF-8 -nopgbrk <id>.pdf <id>.txt`
3. Crear el sidecar `<id>.json` (ver `knowledge/README.md`).
4. Ajustar `server/data/knowledge-base.json`: `base_normativa` y `fuente` con el artículo/página exactos y `confianza: "green"` cuando el texto quede verificado.
