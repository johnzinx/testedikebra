import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../store/useAuth';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.body.classList.toggle('dark-mode');
  };

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [darkMode]);

  // Estilo para fazer a navbar sumir completamente
  const navbarStyle = {
    display: 'none', // Isso remove a navbar do fluxo do documento
  };

  return (
    <header style={navbarStyle}>
      <Link to="/feed" className="brand">DiK</Link>

      <nav>
        <Link to="/feed">Feed</Link>
        <Link to={`/profile/${user?.id}`}>Perfil</Link>
        <Link to="/jobs">Vagas</Link>
        <Link to="/messages">Chats</Link>
        <Link to="/notifications">Notificações</Link>
        <Link to="/settings">Configurações</Link>
      </nav>

      <div className="user">
        <button onClick={toggleDarkMode} className="dark-toggle">
          {darkMode ? '☀️' : '🌙'}
        </button>

        {user && (
          <>
            <img src={user.avatar} alt={user.name} className="avatar" />
            <span>{user.name}</span>
            <button onClick={handleLogout}>Sair</button>
          </>
        )}
      </div>
    </header>
  );
}