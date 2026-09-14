import { useLocation } from 'react-router-dom';
import Header from '../components/Header.jsx';
import Chat from '../components/Chat.jsx';
import { usePersonero } from '../context/PersoneroContext.jsx';

export default function ChatPage() {
  const location = useLocation();
  const seed = location.state?.seed || null;
  const { perfil } = usePersonero();

  return (
    <div className="chat-page">
      <Header
        title="PREGUNTAR"
        subtitle={perfil ? `Asistente virtual para ${perfil.label}` : 'Asistente virtual para personeros'}
        showBack
      />
      <Chat key={seed || 'chat'} seed={seed} />
    </div>
  );
}
