import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { PersoneroProvider } from './context/PersoneroContext.jsx';
import './styles.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <PersoneroProvider>
        <App />
      </PersoneroProvider>
    </BrowserRouter>
  </React.StrictMode>
);
