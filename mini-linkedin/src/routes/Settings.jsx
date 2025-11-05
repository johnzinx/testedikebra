import { useState } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import useAuth from '../store/useAuth';
import useAuthStore from '../store/useAuth';

export default function Settings() {
  const { user, logout } = useAuth();
  const { profileData } = useAuthStore();
  const [openSection, setOpenSection] = useState(null);
  const [curriculo, setCurriculo] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [curriculoURL, setCurriculoURL] = useState(profileData.curriculoURL || '');

  const CLOUDINARY_CLOUD_NAME = 'del48up33';
  const CLOUDINARY_UPLOAD_PRESET = 'dkebra';

  const dadosCarregados = profileData || {};

  const handleLogout = () => logout && logout();
  const toggleSection = (name) => setOpenSection(openSection === name ? null : name);

  // paleta
  const colors = {
    primary: '#E53E3E',
    background: '#f8f8f8',
    cardBg: '#ffffff',
    text: '#2d3748',
    textMuted: '#718096',
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
    itemHeader: { display: 'flex', flexDirection: 'column', color: colors.text },
    itemTitle: { margin: 0, fontSize: '1.1rem', fontWeight: '600' },
    itemDescription: {
      margin: '0.2rem 0 0 0',
      fontSize: '0.85rem',
      color: colors.textMuted,
    },
    contentArea: {
      padding: '1rem 1.5rem 1.5rem 1.5rem',
      backgroundColor: colors.cardBg,
      borderRadius: '0 0 8px 8px',
      borderTop: `1px solid ${colors.hover}`,
      marginBottom: '1rem',
    },
    infoText: { marginBottom: '1rem', fontSize: '1rem', color: colors.text },
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
    buttonPrimary: {
      ...buttonBase,
      backgroundColor: colors.primary,
      color: 'white',
    },
  };

  const ArrowIcon = ({ isOpen }) => (
    <span
      style={{
        fontSize: '1.2rem',
        fontWeight: 'bold',
        color: colors.textMuted,
        transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
        transition: 'transform 0.2s ease',
        paddingLeft: '1rem',
      }}
    >
      &gt;
    </span>
  );

  // ======== UPLOAD DO CURRÍCULO ========
  const handleCurriculoChange = (e) => {
    if (e.target.files[0]) {
      setCurriculo(e.target.files[0]);
    }
  };

  const handleUploadCurriculo = async () => {
    if (!curriculo || !user) return;
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', curriculo);
      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/upload`,
        { method: 'POST', body: formData }
      );

      if (!res.ok) throw new Error('Erro ao enviar currículo.');

      const data = await res.json();
      const fileURL = data.secure_url;

      await setDoc(doc(db, 'users', user.uid), { curriculoURL: fileURL }, { merge: true });
      setCurriculoURL(fileURL);
      setCurriculo(null);
      alert('Currículo enviado com sucesso!');
    } catch (err) {
      console.error(err);
      alert('Erro ao enviar o currículo.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <section style={styles.section}>
      <h1 style={styles.h1}>Configurações da Conta</h1>

      {/* 1. INFORMAÇÕES DA CONTA */}
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
            E-mail: <strong>{user?.email}</strong>
          </p>
          <p style={styles.infoText}>
            Nome: <strong>{dadosCarregados.nome}</strong>
          </p>
          <p style={styles.infoText}>
            Tipo de Conta: <strong>{dadosCarregados.tipoUsuario}</strong>
          </p>
          <p style={styles.infoText}>
            Data de Nascimento: <strong>{dadosCarregados.dataNascimento}</strong>
          </p>
          <p style={styles.infoText}>
            Telefone: <strong>{dadosCarregados.telefone}</strong>
          </p>

          {/* MOSTRAR APENAS SE FOR CONTA PCD */}
          {dadosCarregados.tipoUsuario === 'pcd' && (
            <>
              <hr style={{ margin: '1rem 0', border: 'none', borderTop: '1px solid #ddd' }} />
              <h3 style={{ color: colors.text, marginBottom: '0.75rem' }}>Currículo</h3>

              {curriculoURL ? (
                <p style={styles.infoText}>
                  Currículo Atual:{' '}
                  <a href={curriculoURL} target="_blank" rel="noopener noreferrer" style={{ color: colors.primary }}>
                    Visualizar Currículo
                  </a>
                </p>
              ) : (
                <p style={styles.infoText}>Nenhum currículo enviado ainda.</p>
              )}

              <input type="file" accept=".pdf,.doc,.docx" onChange={handleCurriculoChange} />
              <button
                style={styles.buttonPrimary}
                onClick={handleUploadCurriculo}
                disabled={uploading || !curriculo}
              >
                {uploading ? 'Enviando...' : 'Enviar Currículo'}
              </button>
            </>
          )}
        </div>
      )}

      {/* 2. AÇÕES DE SEGURANÇA */}
      <div
        style={styles.settingItem(openSection === 'actions')}
        onClick={() => toggleSection('actions')}
      >
        <div style={styles.itemHeader}>
          <p style={styles.itemTitle}>Ações de Segurança</p>
          <p style={styles.itemDescription}>Sair da conta ou realizar ações críticas.</p>
        </div>
        <ArrowIcon isOpen={openSection === 'actions'} />
      </div>

      {openSection === 'actions' && (
        <div style={styles.contentArea}>
          <button style={styles.buttonDanger} onClick={handleLogout}>
            Sair da Conta
          </button>
        </div>
      )}
    </section>
  );
}
