# Documentos oficiales pendientes de descargar a /knowledge

La base local del chat (`server/data/knowledge-base.json`) ya cita estas normas, pero
**falta cargar el PDF + texto extraído** para el buscador RAG/IA y para poder verificar
el articulado palabra por palabra. Descargar desde la fuente oficial y verificar vigencia.

## Prioridad alta

| Documento | Qué aporta | Dónde buscar |
|---|---|---|
| **RENIEC — R.J. N.° 000023-2026-RENIEC/JNAC** | DNI vencido/caduco válido solo para votar el 4/10/2026 | gob.pe/reniec · El Peruano (agosto 2026) |
| **Res. 0837-2025-JNE** | Actas observadas, actas con votos impugnados y actas con solicitud de nulidad | gob.pe/institucion/jne/normas-legales · El Peruano 06/01/2026 |
| **Res. 0838-2025-JNE** | Trámite de solicitudes de nulidad de votación y de elecciones (estándares de prueba) | gob.pe/institucion/jne/normas-legales |
| **Res. 0852-2025-JNE** (articulado completo) | Reglamento de recuento de votos (hoy solo están los considerandos) | gob.pe/institucion/jne/normas-legales |
| **Res. 0003-2026-JNE** | Cronograma electoral ERM 2026 actualizado (Ley 32536): cierre de padrón, tachas, etc. | gob.pe/institucion/jne/normas-legales |
| **Ley N.° 26859 (LOE)** — arts. 29, 127, 154, 190, 363, 382, 384 | Se citan sin el texto | leyes.congreso.gob.pe / spij |

## Prioridad media

| Documento | Qué aporta |
|---|---|
| **Res. 0844-2025-JNE** | Propaganda electoral, publicidad estatal y neutralidad |
| **Res. 0845-2025-JNE** | Fiscalización y sanción de conductas prohibidas de propaganda |
| **Res. 0849-2025-JNE** | Gestión de los JEE |
| **Res. 0839-2025-JNE** | Competencias del JNE en el voto digital |
| **Reglamento ONPE de mesas de sufragio / de la ODPE ERM 2026** | Miembros de mesa (3 titulares + 6 suplentes), coordinadores de local |
| **Protocolo ONPE** para electores trans y no binarios | Garantía del sufragio sin discriminación |
| **Ley N.° 27683** (Elecciones Regionales) y **Ley N.° 26864** (Elecciones Municipales) | Umbral del 30 % y segunda elección regional |
| **Ley N.° 28094** (Organizaciones Políticas) | ROP, personeros legales |
| **Manual de Capacitación Jurisdiccional Electoral ERM 2026 (JNE)** | Criterios de los JEE |

## Cómo cargar cada documento

1. Guardar el PDF en la subcarpeta que corresponda (`JNE/`, `ONPE/`, `LEYES/`, `OTROS/`).
2. Extraer el texto a `<id>.txt` (con `pdf-parse` u otra herramienta).
3. Crear el sidecar `<id>.json` con los metadatos (ver `knowledge/README.md`).
4. Si aplica, añadir/ajustar entradas en `server/data/knowledge-base.json` con
   `base_normativa` y `fuente` apuntando al artículo/página exactos, y subir la
   `confianza` de `yellow` a `green` cuando el texto quede verificado.
