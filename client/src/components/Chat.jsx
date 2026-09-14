import { useEffect, useRef, useState } from 'react';
import MessageBubble from './MessageBubble.jsx';
import QuickQuestions from './QuickQuestions.jsx';
import { usePersonero } from '../context/PersoneroContext.jsx';
import { sendChat } from '../api/client.js';

const WELCOME = {
  id: 'welcome',
  role: 'assistant',
  text:
    'Hola. Soy el Asistente del Personero ERM 2026.\n\n' +
    'Puedo ayudarte con información sobre tus funciones, derechos, deberes y ' +
    'procedimientos durante las Elecciones Regionales y Municipales 2026.\n\n' +
    'Selecciona una opción o escribe tu pregunta.',
};

let idSeq = 1;
const nextId = () => `m${idSeq++}`;

// Tiempo mínimo mostrando "Escribiendo…" aunque la respuesta local sea instantánea,
// para que se note que el asistente está buscando la información.
const MIN_THINKING_MS = 700;
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export default function Chat({ seed }) {
  const { perfil } = usePersonero();
  const [messages, setMessages] = useState([WELCOME]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);
  const seededRef = useRef(false);
  const lastMessageRef = useRef(null);
  const wasBusyRef = useRef(false);

  // Autoajusta la altura del área de texto según lo que se escribe.
  function autoGrow(el) {
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 120) + 'px';
  }

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    if (busy) {
      // Esperando respuesta: bajar para que se vea "Escribiendo…".
      el.scrollTop = el.scrollHeight;
    } else if (wasBusyRef.current && lastMessageRef.current) {
      // La respuesta acaba de llegar: mostrarla desde su inicio, no desde el final,
      // para que se pueda leer de arriba hacia abajo sin tener que subir el scroll.
      // offsetTop no sirve aquí (es relativo al offsetParent posicionado más cercano,
      // no al contenedor con scroll), así que se calcula con getBoundingClientRect.
      const containerTop = el.getBoundingClientRect().top;
      const targetTop = lastMessageRef.current.getBoundingClientRect().top;
      el.scrollTop = Math.max(el.scrollTop + (targetTop - containerTop) - 8, 0);
    } else {
      el.scrollTop = el.scrollHeight;
    }
    wasBusyRef.current = busy;
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
    if (inputRef.current) inputRef.current.style.height = 'auto';
    setBusy(true);

    const startedAt = Date.now();
    const res = await sendChat({
      message: text,
      perfil: perfil?.id || null,
      history,
    });
    const elapsed = Date.now() - startedAt;
    if (elapsed < MIN_THINKING_MS) {
      await wait(MIN_THINKING_MS - elapsed);
    }

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
        {messages.map((m, i) => (
          <MessageBubble
            key={m.id}
            message={m}
            ref={i === messages.length - 1 ? lastMessageRef : null}
          />
        ))}
        {busy && <MessageBubble message={{ id: 'typing', role: 'assistant', typing: true }} />}
      </div>

      <QuickQuestions onPick={(q) => submit(q)} />

      <form
        className="composer"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <textarea
          ref={inputRef}
          className="composer__input"
          rows={1}
          enterKeyHint="send"
          placeholder="Escribe tu pregunta aquí…"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            autoGrow(e.target);
          }}
          onKeyDown={onKeyDown}
        />
        <button
          type="submit"
          className="composer__send"
          disabled={busy || !input.trim()}
          aria-label="Enviar pregunta"
        >
          ➤
        </button>
      </form>
    </div>
  );
}
