import { forwardRef } from 'react';
import SourceCard from './SourceCard.jsx';
import { CATEGORIA_LABEL } from '../data/categorias.js';

const CONFIDENCE_TEXT = {
  green: 'Fundamento normativo encontrado',
  yellow: 'Respuesta requiere verificación',
  red: 'No se encontró fundamento suficiente',
};

// Pinta en verde el "✓" de lo que sí puedes hacer y en rojo la "✗" de lo que no,
// sin tocar el resto del texto de la línea.
function renderLine(line, key) {
  if (line.startsWith('✓ ')) {
    return (
      <div key={key}>
        <span className="line-mark line-mark--ok">✓</span>
        {line.slice(1)}
      </div>
    );
  }
  if (line.startsWith('✗ ')) {
    return (
      <div key={key}>
        <span className="line-mark line-mark--bad">✗</span>
        {line.slice(1)}
      </div>
    );
  }
  return <div key={key}>{line || ' '}</div>;
}

const MessageBubble = forwardRef(function MessageBubble({ message, onRequestNormText }, ref) {
  const isUser = message.role === 'user';
  // Solo tiene sentido ofrecer "ver el texto de la norma" cuando la respuesta
  // cita una fuente y todavía no es, ella misma, el texto de un artículo.
  const canShowNormText = !isUser && message.source && message.origin !== 'articulo';

  if (message.typing) {
    return (
      <div className="bubble-row" ref={ref}>
        <div className="bubble bubble--assistant bubble--typing">Escribiendo…</div>
      </div>
    );
  }

  return (
    <div className={`bubble-row ${isUser ? 'bubble-row--user' : ''}`} ref={ref}>
      <div className={`bubble ${isUser ? 'bubble--user' : 'bubble--assistant'}`}>
        <div>{message.text.split('\n').map(renderLine)}</div>

        {!isUser && message.classification && (
          <span className="chip-class">
            {CATEGORIA_LABEL[message.classification] || message.classification}
          </span>
        )}

        {!isUser && message.source && <SourceCard source={message.source} />}

        {canShowNormText && (
          <button
            type="button"
            className="norm-text-btn"
            onClick={onRequestNormText}
          >
            Ver qué dice esta norma
          </button>
        )}

        {!isUser && message.confidence && CONFIDENCE_TEXT[message.confidence] && (
          <div className={`confidence confidence--${message.confidence}`}>
            {CONFIDENCE_TEXT[message.confidence]}
          </div>
        )}
      </div>
    </div>
  );
});

export default MessageBubble;
