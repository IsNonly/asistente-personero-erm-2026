import { Routes, Route, Navigate } from 'react-router-dom';
import PersoneroSelector from './components/PersoneroSelector.jsx';
import BottomNavigation from './components/BottomNavigation.jsx';
import Home from './pages/Home.jsx';
import ChatPage from './pages/ChatPage.jsx';
import Incidents from './pages/Incidents.jsx';
import Normativa from './pages/Normativa.jsx';
import QueHagoSi from './pages/QueHagoSi.jsx';
import ModoJornada from './pages/ModoJornada.jsx';
import { usePersonero } from './context/PersoneroContext.jsx';

export default function App() {
  const { isReady } = usePersonero();

  return (
    <div className="app-shell">
      {!isReady && <PersoneroSelector />}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/que-hago-si" element={<QueHagoSi />} />
        <Route path="/incidencias" element={<Incidents />} />
        <Route path="/normativa" element={<Normativa />} />
        <Route path="/jornada" element={<ModoJornada />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <BottomNavigation />
    </div>
  );
}
