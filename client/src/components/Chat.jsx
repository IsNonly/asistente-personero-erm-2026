import { useEffect, useRef, useState } from 'react';
import MessageBubble from './MessageBubble.jsx';
import QuickQuestions from './QuickQuestions.jsx';
import { usePersonero } from '../context/PersoneroContext.jsx';
import { sendChat } from '../api/client.js';

const WELCOME = {
  id: 'welcome',
  role: 'assistant',
  text:
    '👋 Hola. Soy el Asistente del Personero ERM 2026.\n\n' +
    'Puedo ayudarte con información sobre tus funciones, derechos, deberes y ' +
    'procedimientos durante las Elecciones Regionales y Municipales 2026.\n\n' +
    'Selecciona una opción o escribe tu pregunta.',
};

let idSeq = 1;
const nextId = () => `m${idSeq++}`;

export default function Chat({ seed }) {
  const { perfil } = usePersonero();
  const [messages, setMessages] = useState([WELCOME]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef(null);
  const seededRef = useRef(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, busy]);

  useEffect(() => {
    if (seed && !seededRef.current) {
      seededRef.current = true;
      submit(seed);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seed]);

  async function submit(rawText) {
    const text = (rawText ?? input).trim();
    if (!text || busy) return;

    const userMsg = { id: nextId(), role: 'user', text };
    const history = messages
      .filter((m) => m.id !== 'welcome')
      .map((m) => ({ role: m.role, content: m.text }));

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setBusy(true);

    const res = await sendChat({
      message: text,
      perfil: perfil?.id || null,
      history,
    });

    setMessages((prev) => [
      ...prev,
      {
        id: nextId(),
        role: 'assistant',
        text: res.answer,
        confidence: res.confidence,
        classification: res.classification,
        source: res.source || null,
      },
    ]);
    setBusy(false);
  }

  function onKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }

  return (
    <div className="chat">
      <div className="chat__scroll" ref={scrollRef}>
        {messages.map((m) => (
          <MessageBubble key={m.id} message={m} />
        ))}
        {busy && <MessageBubble message={{ id: 'typing', role: 'assistant', typing: true }} />}
      </div>

      <QuickQuestions onPick={(q) => submit(q)} />

      <div className="composer">
        <textarea
          className="composer__input"
          rows={1}
          placeholder="Escribe tu pregunta aquí…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
        />
        <button
          className="composer__send"
          onClick={() => submit()}
          disabled={busy || !input.trim()}
          aria-label="Enviar"
        >
          ➤
        </button>
      </div>
    </div>
  );
}
