import { Link } from 'react-router-dom';
import useAuth from '../store/useAuth';
import { useEffect, useState } from 'react';
import { FiMenu, FiX, FiUser, FiHome, FiBriefcase, FiMessageCircle, FiBell, FiSettings } from 'react-icons/fi';

export default function Sidebar() {
  const { user, profileData } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  const breakpoint = 768;

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    if (windowWidth > breakpoint) {
      setIsMenuOpen(false);
    }
    return () => window.removeEventListener('resize', handleResize);
  }, [windowWidth]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const styles = {
    openMenuButton: {
      position: 'fixed',
      top: '0.5rem',
      left: '0.5rem',
      zIndex: 11,
      cursor: 'pointer',
      backgroundColor: '#E53E3E',
      color: 'white',
      border: 'none',
      borderRadius: '50%',
      width: '44px',
      height: '44px',
      display: windowWidth <= breakpoint ? 'flex' : 'none',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
      transition: 'transform 0.2s ease',
    },
    sidebar: {
      backgroundColor: '#E53E3E',
      width: windowWidth > breakpoint ? '250px' : '80vw',
      maxWidth: '300px',
      height: '100vh',
      position: 'fixed',
      top: 0,
      left: 0,
      transform: isMenuOpen || windowWidth > breakpoint ? 'translateX(0)' : 'translateX(-100%)',
      transition: 'transform 0.3s ease-in-out',
      zIndex: 10,
      boxShadow: '2px 0 5px rgba(0,0,0,0.2)',
      padding: '1rem',
      display: 'flex',
      flexDirection: 'column',
      borderTopRightRadius: windowWidth > breakpoint ? '0px' : '20px',
      borderBottomRightRadius: windowWidth > breakpoint ? '0px' : '20px',
      overflowY: 'auto',
    },
    closeMenuButton: {
      cursor: 'pointer',
      color: 'white',
      width: '36px',
      height: '36px',
      display: windowWidth <= breakpoint ? 'flex' : 'none',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      borderRadius: '50%',
      position: 'absolute',
      top: '0.5rem',
      right: '0.5rem',
    },
    profileSection: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      paddingTop: '1rem',
      paddingBottom: '1rem',
      borderBottom: '1px solid rgba(255, 255, 255, 0.3)',
      marginBottom: '1rem',
      gap: '0.25rem',
    },
    avatar: {
      width: '70px',
      height: '70px',
      borderRadius: '50%',
      marginBottom: '0.5rem',
      border: '2px solid white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    username: {
      margin: 0,
      fontSize: '1.2rem',
      fontWeight: 'bold',
      textAlign: 'center',
      color: 'white',
    },
    userHeadline: {
      margin: 0,
      fontSize: '0.8rem',
      textAlign: 'center',
      color: 'rgba(255, 255, 255, 0.7)',
    },
    profileLink: {
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      color: 'white',
      textDecoration: 'none',
      padding: '0.6rem 1rem',
      borderRadius: '9999px',
      fontWeight: 'bold',
      marginTop: '0.75rem',
      textAlign: 'center',
      transition: 'background-color 0.2s ease',
      fontSize: '0.8rem',
    },
    shortcutsCard: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.25rem',
      padding: '0 0.5rem',
    },
    shortcutsTitle: {
      margin: 0,
      fontSize: '1rem',
      fontWeight: 'bold',
      color: 'white',
      paddingLeft: '0.5rem',
    },
    navList: {
      listStyle: 'none',
      padding: 0,
      margin: 0,
      display: 'flex',
      flexDirection: 'column',
      gap: '0.25rem',
    },
    navItem: {
      padding: '0.6rem 1rem',
      borderRadius: '9999px',
      backgroundColor: 'rgba(255, 255, 255, 0.3)',
      color: 'white',
      textDecoration: 'none',
      fontWeight: 'bold',
      transition: 'background-color 0.2s ease',
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      fontSize: '0.9rem',
    },
    navIcon: {
      width: '20px',
      height: '20px',
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
      <button onClick={toggleMenu} style={styles.openMenuButton}>
        <FiMenu size={24} color="white" />
      </button>
      <aside style={styles.sidebar}>
        <button onClick={toggleMenu} style={styles.closeMenuButton}>
          <FiX size={24} color="white" />
        </button>
        {user && (
          <div style={styles.profileSection}>
            <div style={styles.avatar}>
              {profileData && profileData.fotoURL ? (
                <img src={profileData.fotoURL} alt="Foto de Perfil" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
              ) : (
                <FiUser size={40} color="white" />
              )}
            </div>
            <h3 style={styles.username}>{user.displayName}</h3>
            <p style={styles.userHeadline}>{user.email}</p>
            <Link to={`/profile/${user.uid}`} style={styles.profileLink} onClick={toggleMenu}>
              Ver perfil
            </Link>
          </div>
        )}
        <div style={styles.shortcutsCard}>
          <h4 style={styles.shortcutsTitle}>Atalhos</h4>
          <ul style={styles.navList}>
            <li>
              <Link to="/feed" style={styles.navItem} onClick={toggleMenu}>
                <FiHome size={24} style={styles.navIcon} />
                Feed
              </Link>
            </li>
            <li>
              <Link to="/jobs" style={styles.navItem} onClick={toggleMenu}>
                <FiBriefcase size={24} style={styles.navIcon} />
                Procurar vagas
              </Link>
            </li>
            <li>
              <Link to="/messages" style={styles.navItem} onClick={toggleMenu}>
                <FiMessageCircle size={24} style={styles.navIcon} />
                Mensagens
              </Link>
            </li>
            <li>
              <Link to="/notifications" style={styles.navItem} onClick={toggleMenu}>
                <FiBell size={24} style={styles.navIcon} />
                Notificações
              </Link>
            </li>
            <li>
              <Link to="/settings" style={styles.navItem} onClick={toggleMenu}>
                <FiSettings size={24} style={styles.navIcon} />
                Configurações
              </Link>
            </li>
          </ul>
        </div>
      </aside>
      {isMenuOpen && windowWidth <= breakpoint && <div style={styles.backdrop} onClick={toggleMenu}></div>}
    </>
  );
}