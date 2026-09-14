// Íconos de línea, neutros (heredan el color del texto vía currentColor).
// Se usan en lugar de emojis para mantener una imagen profesional.
const BASE = {
  width: '1em',
  height: '1em',
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': 'true',
};

export function IconHome(props) {
  return (
    <svg {...BASE} {...props}>
      <path d="M4 11.5 12 4l8 7.5" />
      <path d="M6 10v9a1 1 0 0 0 1 1h3v-6h4v6h3a1 1 0 0 0 1-1v-9" />
    </svg>
  );
}

export function IconChat(props) {
  return (
    <svg {...BASE} {...props}>
      <path d="M4 5h16v11H9l-4 4v-4H4z" />
    </svg>
  );
}

export function IconAlert(props) {
  return (
    <svg {...BASE} {...props}>
      <path d="M12 4 3 20h18L12 4z" />
      <path d="M12 10v4" />
      <path d="M12 17h.01" />
    </svg>
  );
}

export function IconBook(props) {
  return (
    <svg {...BASE} {...props}>
      <path d="M4 5.5C5.5 4.6 7.6 4 12 4v15c-4.4 0-6.5.6-8 1.5z" />
      <path d="M20 5.5C18.5 4.6 16.4 4 12 4v15c4.4 0 6.5.6 8 1.5z" />
    </svg>
  );
}

export function IconUser(props) {
  return (
    <svg {...BASE} {...props}>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20c1.2-3.8 4.2-5.5 7-5.5s5.8 1.7 7 5.5" />
    </svg>
  );
}
