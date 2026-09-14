import { forwardRef } from 'react';
import SourceCard from './SourceCard.jsx';
import { CATEGORIA_LABEL } from '../data/categorias.js';

const CONFIDENCE_TEXT = {
  green: 'Fundamento normativo encontrado',
  yellow: 'Respuesta requiere verificación',
  red: 'No se encontró fundamento suficiente',
};

const MessageBubble = forwardRef(function MessageBubble({ message }, ref) {
  const isUser = message.role === 'user';

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
        <div>{message.text}</div>

        {!isUser && message.classification && (
          <span className="chip-class">
            {CATEGORIA_LABEL[message.classification] || message.classification}
          </span>
        )}

        {!isUser && message.source && <SourceCard source={message.source} />}

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
