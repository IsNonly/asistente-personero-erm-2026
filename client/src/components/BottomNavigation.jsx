import { useLocation, useNavigate } from 'react-router-dom';
import { IconHome, IconChat, IconDocument, IconBook } from './icons.jsx';

const ITEMS = [
  { to: '/', label: 'Inicio', Icon: IconHome },
  { to: '/chat', label: 'Preguntar', Icon: IconChat },
  { to: '/cartilla', label: 'Cartilla', Icon: IconDocument },
  { to: '/normativa', label: 'Normativa', Icon: IconBook },
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
            <item.Icon className="bottom-nav__icon" />
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
