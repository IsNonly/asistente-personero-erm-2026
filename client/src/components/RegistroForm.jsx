import { useState } from 'react';
import { usePersonero } from '../context/PersoneroContext.jsx';

// Pantalla de ingreso: pide nombre y celular una sola vez por dispositivo.
export default function RegistroForm() {
  const { setRegistro } = usePersonero();
  const [nombre, setNombre] = useState('');
  const [celular, setCelular] = useState('');
  const [error, setError] = useState('');

  function onSubmit(e) {
    e.preventDefault();
    const n = nombre.replace(/\s+/g, ' ').trim();
    let c = celular.replace(/\D/g, '');
    if (c.length === 11 && c.startsWith('51')) c = c.slice(2);

    if (n.length < 3) return setError('Ingresa tu nombre completo.');
    if (!/^9\d{8}$/.test(c)) return setError('Ingresa un celular válido de 9 dígitos (empieza con 9).');

    setError('');
    setRegistro({ nombre: n, celular: c });
  }

  return (
    <div className="selector">
      <h1 className="selector__title">Asistente del Personero — ERM 2026</h1>
      <p className="selector__subtitle">
        Tu guía rápida para actuar con seguridad en cada etapa del proceso electoral.
        Para ingresar, regístrate con tu nombre y tu número de celular.
      </p>

      <form className="registro-card" onSubmit={onSubmit} noValidate>
        <div className="form-field">
          <label htmlFor="reg-nombre">Nombre completo</label>
          <input
            id="reg-nombre"
            type="text"
            autoComplete="name"
            placeholder="Ej.: María Quispe Huamán"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            maxLength={120}
          />
        </div>

        <div className="form-field">
          <label htmlFor="reg-celular">Número de celular</label>
          <input
            id="reg-celular"
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            placeholder="9XX XXX XXX"
            value={celular}
            onChange={(e) => setCelular(e.target.value)}
            maxLength={15}
          />
        </div>

        {error && <p className="registro-card__error">{error}</p>}

        <button type="submit" className="btn btn--block">
          Ingresar
        </button>

        <p className="registro-card__note">
          Tus datos solo se usan para la coordinación del equipo de personeros.
          Te los pediremos una sola vez en este dispositivo.
        </p>
      </form>
    </div>
  );
}
