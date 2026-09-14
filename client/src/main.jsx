import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { PersoneroProvider } from './context/PersoneroContext.jsx';
import './styles.css';

// Alto real visible (--app-vh), a diferencia de 100svh/100dvh que no se
// achican cuando se abre el teclado del celular. Con esto la barra de
// escribir, las preguntas rápidas y la navegación inferior se reacomodan
// correctamente al abrir/cerrar el teclado en vez de quedar empujadas
// fuera del área visible.
function setAppViewportHeight() {
  const vv = window.visualViewport;
  const h = vv ? vv.height : window.innerHeight;
  document.documentElement.style.setProperty('--app-vh', `${h}px`);
}
setAppViewportHeight();
if (window.visualViewport) {
  window.visualViewport.addEventListener('resize', setAppViewportHeight);
  window.visualViewport.addEventListener('scroll', setAppViewportHeight);
} else {
  window.addEventListener('resize', setAppViewportHeight);
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <PersoneroProvider>
        <App />
      </PersoneroProvider>
    </BrowserRouter>
  </React.StrictMode>
);
