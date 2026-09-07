import { useLocation } from 'react-router-dom';
import Header from '../components/Header.jsx';
import Chat from '../components/Chat.jsx';

export default function ChatPage() {
  const location = useLocation();
  const seed = location.state?.seed || null;

  return (
    <div className="chat-page">
      <Header title="PREGUNTAR" subtitle="Asistente virtual para personeros" showBack />
      <Chat key={seed || 'chat'} seed={seed} />
    </div>
  );
}
