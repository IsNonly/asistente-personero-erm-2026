import { useEffect, useState } from 'react';

// TEMPORAL — solo para diagnosticar el bug de las preguntas rápidas en móvil.
// Quitar de ChatPage.jsx una vez identificada la causa.
export default function DebugViewport() {
  const [info, setInfo] = useState(null);

  useEffect(() => {
    function collect() {
      const chatPage = document.querySelector('.chat-page');
      const nav = document.querySelector('.bottom-nav');
      const qq = document.querySelector('.quick-questions');
      const cs = chatPage ? getComputedStyle(chatPage) : null;
      const vv = window.visualViewport;
      setInfo({
        ua: navigator.userAgent,
        hasVV: !!vv,
        vvHeight: vv ? Math.round(vv.height) : null,
        innerHeight: window.innerHeight,
        clientHeight: document.documentElement.clientHeight,
        appVh: getComputedStyle(document.documentElement).getPropertyValue('--app-vh').trim(),
        chatPageHeight: cs ? cs.height : null,
        chatPageOverflow: cs ? cs.overflow : null,
        navBottom: nav ? Math.round(nav.getBoundingClientRect().bottom) : null,
        navTop: nav ? Math.round(nav.getBoundingClientRect().top) : null,
        qqBottom: qq ? Math.round(qq.getBoundingClientRect().bottom) : null,
      });
    }
    collect();
    const t = setInterval(collect, 500);
    return () => clearInterval(t);
  }, []);

  if (!info) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 4,
        left: 4,
        right: 4,
        zIndex: 999,
        background: 'rgba(0,0,0,0.85)',
        color: '#0f0',
        fontSize: 9,
        fontFamily: 'monospace',
        padding: '6px 8px',
        borderRadius: 6,
        lineHeight: 1.4,
        wordBreak: 'break-all',
        pointerEvents: 'none',
      }}
    >
      <div>UA: {info.ua}</div>
      <div>hasVisualViewport: {String(info.hasVV)} · vvHeight: {info.vvHeight}</div>
      <div>innerHeight: {info.innerHeight} · clientHeight: {info.clientHeight}</div>
      <div>--app-vh: {info.appVh || '(vacío)'}</div>
      <div>chat-page height: {info.chatPageHeight} · overflow: {info.chatPageOverflow}</div>
      <div>nav top/bottom: {info.navTop}/{info.navBottom} · quick-questions bottom: {info.qqBottom}</div>
    </div>
  );
}
