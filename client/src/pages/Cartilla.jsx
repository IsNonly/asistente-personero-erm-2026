import Header from '../components/Header.jsx';

const CARTILLAS = [
  {
    id: 'tipo1',
    titulo: 'Cartilla Tipo 1 — Municipal Provincial Distrital',
    desc: 'Para circunscripciones donde el 4 de octubre de 2026 solo se elige autoridades municipales (sin elección regional).',
    href: '/cartillas/cartilla-tipo1-mpd.pdf',
  },
  {
    id: 'tipo2',
    titulo: 'Cartilla Tipo 2 — Regional Municipal Provincial Distrital',
    desc: 'Para circunscripciones donde el 4 de octubre de 2026 se elige autoridades regionales y municipales.',
    href: '/cartillas/cartilla-tipo2-rmpd.pdf',
  },
];

export default function Cartilla() {
  return (
    <>
      <Header title="CARTILLA DEL PERSONERO" subtitle="Instrucciones oficiales de la ONPE — ERM 2026" showBack />
      <div className="screen">
        <p className="muted" style={{ marginTop: 12 }}>
          Elige la cartilla que corresponde a tu circunscripción. Se abre en el
          visor de PDF de tu celular o navegador.
        </p>

        <div className="stack" style={{ marginTop: 16 }}>
          {CARTILLAS.map((c) => (
            <a
              key={c.id}
              className="option-item"
              href={c.href}
              target="_blank"
              rel="noreferrer"
              style={{ alignItems: 'flex-start', flexDirection: 'column', gap: 4 }}
            >
              <strong>{c.titulo}</strong>
              <span className="muted" style={{ fontSize: 13 }}>{c.desc}</span>
            </a>
          ))}
        </div>

        <p className="muted" style={{ marginTop: 16 }}>
          Fuente: ONPE — Cartilla de instrucciones para personeros, ERM 2026.
        </p>
      </div>
    </>
  );
}
