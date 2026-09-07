import { useLocation, useNavigate } from 'react-router-dom';

const ITEMS = [
  { to: '/', icon: '🏠', label: 'Inicio' },
  { to: '/chat', icon: '💬', label: 'Preguntar' },
  { to: '/incidencias', icon: '🚨', label: 'Incidencias' },
  { to: '/normativa', icon: '📚', label: 'Normativa' },
  { to: '/perfil', icon: '👤', label: 'Mi perfil' },
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
            <span className="bottom-nav__icon" aria-hidden="true">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
