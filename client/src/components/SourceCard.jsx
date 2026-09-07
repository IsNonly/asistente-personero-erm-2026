// Tarjeta que muestra la fuente normativa de una respuesta del asistente.
export default function SourceCard({ source }) {
  if (!source) return null;
  return (
    <div className="source-card">
      <div className="source-card__label">📚 FUENTE</div>
      <div>{source}</div>
    </div>
  );
}
