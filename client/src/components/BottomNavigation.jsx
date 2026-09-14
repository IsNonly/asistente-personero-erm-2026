import { useLocation, useNavigate } from 'react-router-dom';

const ITEMS = [
  { to: '/', label: 'Inicio' },
  { to: '/chat', label: 'Preguntar' },
  { to: '/incidencias', label: 'Incidencias' },
  { to: '/normativa', label: 'Normativa' },
  { to: '/perfil', label: 'Mi perfil' },
];

export default function BottomNavigation() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <nav className="bottom-nav" aria-label="Navegación principal">
      {ITEMS.map((item) => {
        const active =
          item.to === '/' ? pathname === '/' : pathname.startsWith(item.to);
        return (
          <button
            key={item.to}
            className={`bottom-nav__item ${active ? 'is-active' : ''}`}
            onClick={() => navigate(item.to)}
            aria-current={active ? 'page' : undefined}
          >
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
