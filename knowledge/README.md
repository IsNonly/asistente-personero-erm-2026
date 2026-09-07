# /knowledge — Base normativa oficial

Coloca aquí los **documentos oficiales** de la normativa electoral. La aplicación
**no inventa** contenido normativo: solo responde con lo que exista en esta carpeta
(una vez ingestado e indexado).

## Estructura

```
knowledge/
  JNE/     Resoluciones y reglamentos del Jurado Nacional de Elecciones
  ONPE/    Cartillas e instructivos de la ONPE
  LEYES/   Leyes electorales (Ley Orgánica de Elecciones, Ley de Org. Políticas, etc.)
  OTROS/   Manuales y material de otras entidades
```

## Formato de cada documento

Por cada documento coloca **dos archivos** con el mismo nombre base:

| Archivo | Contenido |
|---|---|
| `<id>.txt` o `<id>.md` | Texto del documento (etapa 1). Los `.pdf` requieren un parser adicional. |
| `<id>.json` | Metadatos (ver ejemplo abajo) |

### Ejemplo de metadatos (`res-0850-2025-jne.json`)

```json
{
  "id": "res-0850-2025-jne",
  "entidad": "JNE",
  "tipo_documento": "Resolución",
  "numero": "N.° 0850-2025-JNE",
  "titulo": "Reglamento sobre participación de personeros en procesos electorales",
  "fecha_publicacion": "2025-01-01",
  "fecha_vigencia": null,
  "estado": "vigente",
  "version": "1",
  "proceso": "ERM 2026",
  "url_oficial": "",
  "prioridad": 1
}
```

## Ingesta

```bash
npm run ingest        # carga documentos y genera chunks
npm run embeddings    # genera embeddings (requiere configurar el servicio)
```

## Documentos de referencia esperados (ERM 2026)

- Resolución N.° 0850-2025-JNE — Reglamento sobre participación de personeros
- Resolución N.° 0837-2025-JNE — Reglamento de Actas Observadas
- Resolución N.° 0838-2025-JNE — Trámite de solicitudes de nulidad ERM 2026
- Resolución N.° 0852-2025-JNE — Reglamento de recuento de votos
- Resolución N.° 0844-2025-JNE — Propaganda electoral, publicidad estatal y neutralidad
- Resolución N.° 0845-2025-JNE — Conductas prohibidas y procedimiento sancionador
- Ley N.° 26859 — Ley Orgánica de Elecciones
- Ley N.° 28094 — Ley de Organizaciones Políticas
- Cartilla de Instrucciones para Personeros ERM 2026 — ONPE
- Manual de Capacitación Jurisdiccional Electoral ERM 2026 — JNE

> Descarga cada documento desde su fuente oficial (JNE / ONPE) y verifícalo antes de cargarlo.
