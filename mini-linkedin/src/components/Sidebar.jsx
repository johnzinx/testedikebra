import { Link } from 'react-router-dom';
import useAuth from '../store/useAuth';
import { useEffect, useState } from 'react';

export default function Sidebar() {
  const { user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  const breakpoint = 768;

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const styles = {
    // Container principal que lida com o layout de duas colunas em telas grandes
    mainContainer: {
      display: 'flex',
      minHeight: '100vh',
      backgroundColor: '#f3f4f6',
    },
    // Botão de menu que aparece no canto superior esquerdo em telas pequenas
    openMenuButton: {
      position: 'fixed',
      top: '1rem',
      left: '1rem',
      zIndex: 11,
      cursor: 'pointer',
      backgroundColor: '#E53E3E',
      color: 'white',
      border: 'none',
      borderRadius: '50%',
      width: '40px',
      height: '40px',
      display: windowWidth <= breakpoint ? 'flex' : 'none',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
    },
    // Estilos da barra lateral
    sidebar: {
      backgroundColor: '#E53E3E',
      width: windowWidth > breakpoint ? '250px' : '85vw',
      maxWidth: '400px',
      height: '100vh',
      position: 'fixed',
      top: 0,
      left: 0,
      transform: isMenuOpen || windowWidth > breakpoint ? 'translateX(0)' : 'translateX(-100%)',
      transition: 'transform 0.3s ease-in-out',
      zIndex: 10,
      boxShadow: '2px 0 5px rgba(0,0,0,0.2)',
      padding: '1.5rem 1rem',
      display: 'flex',
      flexDirection: 'column',
      borderTopRightRadius: '30px',
      borderBottomRightRadius: '30px',
    },
    // Botão de fechar que aparece no canto superior esquerdo da sidebar em mobile
    closeMenuButton: {
      cursor: 'pointer',
      color: 'white',
      width: '32px',
      height: '32px',
      display: windowWidth <= breakpoint ? 'flex' : 'none',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      borderRadius: '50%',
      position: 'absolute',
      top: '1rem',
      left: '1rem',
    },
    profileSection: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      paddingTop: '3rem', // Espaço para o botão de fechar
      paddingBottom: '2rem',
      borderBottom: '1px solid rgba(255, 255, 255, 0.3)',
      marginBottom: '2rem',
      gap: '0.5rem',
    },
    avatar: {
      width: '80px',
      height: '80px',
      borderRadius: '50%',
      marginBottom: '0.5rem',
      border: '3px solid white',
    },
    username: {
      margin: 0,
      fontSize: '1.5rem',
      fontWeight: 'bold',
      textAlign: 'center',
    },
    userHeadline: {
      margin: 0,
      fontSize: '1rem',
      textAlign: 'center',
      color: 'rgba(255, 255, 255, 0.7)',
    },
    profileLink: {
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      color: 'white',
      textDecoration: 'none',
      padding: '0.75rem 1.5rem',
      borderRadius: '9999px',
      fontWeight: 'bold',
      marginTop: '1rem',
      textAlign: 'center',
      transition: 'background-color 0.2s ease',
    },
    shortcutsCard: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
    },
    shortcutsTitle: {
      margin: 0,
      fontSize: '1.25rem',
      fontWeight: 'bold',
      color: 'white',
    },
    navList: {
      listStyle: 'none',
      padding: 0,
      margin: 0,
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem',
    },
    navItem: {
      padding: '0.75rem 1.5rem',
      borderRadius: '9999px',
      backgroundColor: 'rgba(255, 255, 255, 0.3)',
      color: 'white',
      textDecoration: 'none',
      fontWeight: 'bold',
      transition: 'background-color 0.2s ease',
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
    },
    navIcon: {
      width: '24px',
      height: '24px',
      fill: 'white',
    },
    backdrop: {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: isMenuOpen && windowWidth <= breakpoint ? 'block' : 'none',
      zIndex: 9,
    },
  };

  return (
    <>
      {/* Botão para abrir o menu em telas pequenas */}
      <button onClick={toggleMenu} style={styles.openMenuButton}>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
        </svg>
      </button>

      {/* A Sidebar */}
      <aside style={styles.sidebar}>
        {/* Botão de fechar para mobile */}
        <button onClick={toggleMenu} style={styles.closeMenuButton}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {user && (
          <div style={styles.profileSection}>
            <img src={user.avatar} alt={user.name} style={styles.avatar} />
            <h3 style={styles.username}>{user.name}</h3>
            <p style={styles.userHeadline}>{user.headline}</p>
            <Link to={`/profile/${user.id}`} style={styles.profileLink} onClick={toggleMenu}>Ver perfil</Link>
          </div>
        )}

        <div style={styles.shortcutsCard}>
          <h4 style={styles.shortcutsTitle}>Atalhos</h4>
          <ul style={styles.navList}>
            <li>
              <Link to="/feed" style={styles.navItem} onClick={toggleMenu}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="white" style={styles.navIcon}>
                  <path d="M4 6h16M4 12h16m-7 6h7" />
                </svg>
                Feed
              </Link>
            </li>
            <li>
              <Link to="/jobs" style={styles.navItem} onClick={toggleMenu}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="white" style={styles.navIcon}>
                  <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                Procurar vagas
              </Link>
            </li>
            <li>
              <Link to="/messages" style={styles.navItem} onClick={toggleMenu}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="white" style={styles.navIcon}>
                  <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.894A12.593 12.593 0 013 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Mensagens
              </Link>
            </li>
            <li>
              <Link to="/notifications" style={styles.navItem} onClick={toggleMenu}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="white" style={styles.navIcon}>
                  <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6.032 7.284 5 8.916V14a2 2 0 00-2 2v2h18v-2a2 2 0 00-2-2z" />
                </svg>
                Notificações
              </Link>
            </li>
            <li>
              <Link to="/settings" style={styles.navItem} onClick={toggleMenu}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="white" style={styles.navIcon}>
                  <path d="M10.325 4.317c.426-.97 1.528-.97 1.954 0l.477 1.099a1.998 1.998 0 001.372 1.372l1.099.477c.97.426.97 1.528 0 1.954l-1.099.477a1.998 1.998 0 00-1.372 1.372l-.477 1.099c-.426.97-1.528.97-1.954 0l-.477-1.099a1.998 1.998 0 00-1.372-1.372l-1.099-.477c-.97-.426-.97-1.528 0-1.954l1.099-.477a1.998 1.998 0 001.372-1.372l.477-1.099zM15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Configurações
              </Link>
            </li>
          </ul>
        </div>
      </aside>

      {/* Backdrop para fechar o menu ao clicar fora dele em mobile */}
      {isMenuOpen && windowWidth <= breakpoint && <div style={styles.backdrop} onClick={toggleMenu}></div>}
    </>
  );
}