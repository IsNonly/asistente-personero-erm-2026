import { useNavigate } from 'react-router-dom';

export default function Header({ title = 'ASISTENTE DEL PERSONERO', subtitle, showBack = false }) {
  const navigate = useNavigate();
  return (
    <header className="app-header">
      <div className="app-header__row">
        {showBack && (
          <button
            className="app-header__back"
            onClick={() => navigate(-1)}
            aria-label="Volver"
          >
            ‹
          </button>
        )}
        <div>
          <h1 className="app-header__title">{title}</h1>
          <span className="app-header__badge">ERM 2026</span>
        </div>
      </div>
      <p className="app-header__subtitle">
        {subtitle || 'Información electoral oficial para personeros'}
      </p>
    </header>
  );
}
