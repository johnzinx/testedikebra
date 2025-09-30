import { useState } from 'react';
import useAuth from '../store/useAuth';
import useAuthStore from '../store/useAuth';

export default function Settings() {
  const { user, logout } = useAuth();
  const [openSection, setOpenSection] = useState(null); // Para controlar qual seção está aberta
  const { profileData } = useAuthStore();
   
  const dadosCarregados = profileData;

  const handleLogout = () => {
    if (logout) {
      logout();
    }
  };

  const toggleSection = (sectionName) => {
    setOpenSection(openSection === sectionName ? null : sectionName);
  };

  // --- ESTILOS INLINE PARA UM DESIGN MODERNO ---
  const colors = {
    primary: '#E53E3E', // Vermelho (Seu tema)
    background: '#f8f8f8', // Fundo claro
    cardBg: '#ffffff', // Fundo do cartão
    text: '#2d3748', // Texto principal
    textMuted: '#718096', // Texto secundário
    hover: '#f2f2f2',
    danger: '#E53E3E',
  };

  const buttonBase = {
      padding: '0.75rem 1.25rem',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '1rem',
      fontWeight: 'bold',
      border: 'none',
      transition: 'all 0.2s ease',
      marginTop: '1rem',
      textDecoration: 'none',
      textAlign: 'center',
  };
  
  const styles = {
    section: {
      padding: '2rem',
      minHeight: '100vh',
      backgroundColor: colors.background,
    },
    h1: {
      fontSize: '2rem',
      marginBottom: '2rem',
      color: colors.text,
      borderBottom: `2px solid ${colors.primary}`,
      paddingBottom: '0.5rem',
    },
    // Estilo para o item principal de configurações (o que se expande)
    settingItem: (isOpen) => ({
      backgroundColor: isOpen ? colors.hover : colors.cardBg,
      padding: '1.25rem 1.5rem',
      borderRadius: '8px',
      marginBottom: '0.5rem',
      cursor: 'pointer',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
      transition: 'background-color 0.2s ease, box-shadow 0.2s ease',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderLeft: isOpen ? `4px solid ${colors.primary}` : 'none',
    }),
    itemHeader: {
      display: 'flex',
      flexDirection: 'column',
      color: colors.text,
    },
    itemTitle: {
      margin: 0,
      fontSize: '1.1rem',
      fontWeight: '600',
    },
    itemDescription: {
      margin: '0.2rem 0 0 0',
      fontSize: '0.85rem',
      color: colors.textMuted,
    },
    // Estilo para o conteúdo expandido
    contentArea: {
      padding: '1rem 1.5rem 1.5rem 1.5rem',
      backgroundColor: colors.cardBg,
      borderRadius: '0 0 8px 8px',
      borderTop: `1px solid ${colors.hover}`,
      marginBottom: '1rem',
    },
    infoText: {
      marginBottom: '1rem',
      fontSize: '1rem',
      color: colors.text,
    },
    // Botões
    buttonOutline: {
      ...buttonBase,
      backgroundColor: 'transparent',
      border: `2px solid ${colors.primary}`,
      color: colors.primary,
    },
    buttonDanger: {
      ...buttonBase,
      backgroundColor: colors.danger, 
      color: 'white',
      border: `2px solid ${colors.danger}`,
    },
  };

  const ArrowIcon = ({ isOpen }) => (
    <span style={{
      fontSize: '1.2rem',
      fontWeight: 'bold',
      color: colors.textMuted,
      transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
      transition: 'transform 0.2s ease',
      paddingLeft: '1rem',
    }}>
      &gt;
    </span>
  );

  return (
    <section style={styles.section}>
      <h1 style={styles.h1}>Configurações da Conta</h1>

      {/* 1. SEÇÃO DE CONTA E PERFIL */}
      <div 
        style={styles.settingItem(openSection === 'account')} 
        onClick={() => toggleSection('account')}
      >
        <div style={styles.itemHeader}>
          <p style={styles.itemTitle}>Informações da Conta</p>
          <p style={styles.itemDescription}>Visualize as informações da sua conta</p>
        </div>
        <ArrowIcon isOpen={openSection === 'account'} />
      </div>

      {openSection === 'account' && (
        <div style={styles.contentArea}>
          <p style={styles.infoText}>
            E-mail: <span style={{ fontWeight: 'bold' }}>{user?.email}</span>
          </p>
          <p style={styles.infoText}>
            Nome: <span style={{fontWeight: 'bold'}}>{profileData.nome}</span>
          </p>
          <p style={styles.infoText}>
            Data de Nascimento: <span style={{fontWeight: 'bold'}}>{dadosCarregados.dataNascimento}</span>
          </p>
          <p style={styles.infoText}>
            Telefone: <span style={{fontWeight: 'bold'}}>{dadosCarregados.telefone}</span>
          </p>
            
          <button 
            style={styles.buttonDanger} 
            onClick={handleLogout}
          >
            Sair da Conta  
          </button>
        </div>
      )}

      {/* saiar da conta */}
      <div 
        style={styles.settingItem(openSection === 'actions')} 
        onClick={() => toggleSection('actions')}
      >
        <div style={styles.itemHeader}>
          <p style={styles.itemTitle}>Ações de Segurança</p>
          <p style={styles.itemDescription}>Sair da sua conta ou realizar ações críticas.</p>
        </div>
        <ArrowIcon isOpen={openSection === 'actions'} />
      </div>

      {openSection === 'actions' && (
        <div style={styles.contentArea}>
     
          
       
          
        </div>
      )}
      
    

    </section>
  );
}