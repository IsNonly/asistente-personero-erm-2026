// Tarjeta de norma. Solo metadatos; el contenido oficial se carga aparte.
export default function NormCard({ norm }) {
  return (
    <article className="norm-card">
      <span className="norm-card__tag">{norm.entidad} · {norm.tipo_documento}</span>
      <div className="norm-card__number">{norm.numero}</div>
      <div className="norm-card__title">{norm.titulo}</div>

      <div className="norm-card__meta">
        <span>Proceso: {norm.proceso}</span>
        <span>Publicación: {norm.fecha_publicacion}</span>
        <span>Prioridad: {norm.prioridad}</span>
      </div>

      <div className="norm-card__status">📄 {norm.estado} · documento oficial pendiente</div>

      {norm.url_oficial ? (
        <a href={norm.url_oficial} target="_blank" rel="noreferrer">
          Ver documento oficial
        </a>
      ) : (
        <div className="muted" style={{ marginTop: 6 }}>Enlace oficial pendiente de verificación</div>
      )}
    </article>
  );
}
