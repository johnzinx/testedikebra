import React, { useState, useEffect } from 'react';
import { FiPlus, FiBriefcase, FiMapPin, FiCalendar, FiBookmark, FiArrowRight } from 'react-icons/fi';

export default function Jobs() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  const breakpoint = 768;

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const mockJobs = [
    { id: 1, title: "Desenvolvedor(a) Front-end Pleno", company: "Tech Solutions Inc.", location: "Lisboa, Portugal", postedAt: "2024-10-26T10:00:00Z", category: "Desenvolvimento" },
    { id: 2, title: "Analista de Dados Júnior", company: "Data Insight Ltd.", location: "Porto, Portugal", postedAt: "2024-10-25T15:30:00Z", category: "Dados" },
    { id: 3, title: "Designer UI/UX Sênior", company: "Creative Hub Studios", location: "Remoto", postedAt: "2024-10-24T09:15:00Z", category: "Design" },
    { id: 4, title: "Gerente de Projeto Agile", company: "Project Masters SA", location: "Braga, Portugal", postedAt: "2024-10-23T11:45:00Z", category: "Gestão" },
    { id: 5, "title": "Especialista em Marketing Digital", company: "WebBoost Ventures", location: "Faro, Portugal", postedAt: "2024-10-22T14:20:00Z", category: "Marketing" },
    { id: 6, title: "Desenvolvedor(a) Back-end", company: "Code Creators", location: "Lisboa, Portugal", postedAt: "2024-10-21T18:00:00Z", category: "Desenvolvimento" },
    { id: 7, title: "Cientista de Dados", company: "AI Innovators", location: "Remoto", postedAt: "2024-10-20T11:00:00Z", category: "Dados" },
    { id: 8, title: "Product Manager", company: "NextGen Products", location: "Lisboa, Portugal", postedAt: "2024-10-19T14:00:00Z", category: "Gestão" },
  ];

 const styles = {
  jobsSection: {
    padding: windowWidth > breakpoint ? '2rem 4rem' : '1rem',
    backgroundColor: '#ffffff', // fundo claro
    minHeight: '100vh',
    fontFamily: "'Inter', sans-serif",
    color: '#212529', // texto padrão escuro para contraste
    maxWidth: windowWidth > breakpoint ? '1200px' : '100%',
    margin: '0 auto',
    boxSizing: 'border-box',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
    paddingBottom: '0.5rem',
    borderBottom: '1px solid #E53E3E', // borda vermelha
  },
  titleText: {
    fontSize: windowWidth > breakpoint ? '2.5rem' : '1.5rem',
    fontWeight: '700',
    color: '#E53E3E', // título vermelho
    margin: 0,
  },
  addButton: {
    background: '#E53E3E', // botão vermelho
    border: 'none',
    borderRadius: '50%',
    color: 'white',
    cursor: 'pointer',
    height: '40px',
    width: '40px',
    fontSize: '1.5rem',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0 4px 8px rgba(229, 62, 62, 0.3)',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    flexShrink: 0,
  },
  sectionTitle: {
    fontSize: windowWidth > breakpoint ? '1.8rem' : '1.2rem',
    fontWeight: '600',
    color: '#E53E3E', // subtítulo vermelho
    marginBottom: '0.75rem',
    marginTop: '1.5rem',
    borderLeft: '4px solid #E53E3E',
    paddingLeft: '0.75rem',
  },
  jobGrid: {
    display: 'grid',
    gridTemplateColumns: windowWidth > breakpoint ? 'repeat(2, 1fr)' : '1fr',
    gap: '0.75rem',
    marginBottom: '2rem',
  },
  jobCard: {
    backgroundColor: '#fff5f5', // card claro com leve tom de vermelho
    borderRadius: '1rem',
    padding: '1rem',
    boxShadow: '0 5px 20px rgba(0, 0, 0, 0.08)',
    border: '1px solid #E53E3E', // borda vermelha
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  jobCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '0.5rem',
  },
  jobTitle: {
    fontSize: '1rem',
    fontWeight: '700',
    color: '#E53E3E', // título do job vermelho
    margin: 0,
    lineHeight: '1.3',
  },
  bookmarkIcon: {
    color: '#E53E3E', // ícone vermelho
    fontSize: '1.2rem',
    cursor: 'pointer',
  },
  jobMeta: {
    display: 'flex',
    alignItems: 'center',
    color: '#E53E3E', // meta info vermelho
    fontSize: '0.75rem',
    marginBottom: '0.2rem',
  },
  jobMetaIcon: {
    marginRight: '0.4rem',
    color: '#E53E3E',
  },
  applyButton: {
    flex: 1,
    padding: '0.6rem 0.8rem',
    background: '#E53E3E',
    color: 'white',
    borderRadius: '0.5rem',
    fontWeight: '600',
    border: 'none',
    cursor: 'pointer',
    fontSize: '0.85rem',
    boxShadow: '0 4px 10px rgba(229, 62, 62, 0.2)',
  },
  saveButton: {
    flex: 1,
    padding: '0.6rem 0.8rem',
    backgroundColor: 'transparent',
    border: '1.5px solid #E53E3E',
    color: '#E53E3E',
    borderRadius: '0.5rem',
    fontWeight: '600',
    cursor: 'pointer',
    fontSize: '0.85rem',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(229, 62, 62, 0.1)', // overlay suave vermelho
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    padding: '1.25rem',
    borderRadius: '0.75rem',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
    width: '90%',
    maxWidth: '400px',
    textAlign: 'center',
    position: 'relative',
  },
  modalTitle: {
    fontSize: '1.25rem',
    fontWeight: '700',
    marginBottom: '0.75rem',
    color: '#E53E3E',
  },
  modalText: {
    fontSize: '0.85rem',
    color: '#E53E3E',
    marginBottom: '1rem',
  },
  modalCloseButton: {
    padding: '0.5rem 1.25rem',
    background: '#E53E3E',
    color: 'white',
    borderRadius: '9999px',
    fontWeight: '600',
    border: 'none',
    cursor: 'pointer',
    fontSize: '0.8rem',
  },
};


  return (
    <section style={styles.jobsSection}>
      <div style={styles.header}>
        <h1 style={styles.titleText}>Explorar Vagas</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          style={styles.addButton}
          onMouseOver={e => e.currentTarget.style.transform = 'rotate(90deg)'}
          onMouseOut={e => e.currentTarget.style.transform = 'rotate(0deg)'}
        >
          <FiPlus />
        </button>
      </div>
      <h2 style={styles.sectionTitle}>Vagas Recentes</h2>
      <div style={styles.jobGrid}>
        {mockJobs.map(job => (
          <div key={job.id} style={styles.jobCard}>
            <div>
              <div style={styles.jobCardHeader}>
                <h3 style={styles.jobTitle}>{job.title}</h3>
                <FiBookmark style={styles.bookmarkIcon} />
              </div>
              <p style={styles.jobMeta}>
                <FiBriefcase style={styles.jobMetaIcon} /> {job.company}
              </p>
              <p style={styles.jobMeta}>
                <FiMapPin style={styles.jobMetaIcon} /> {job.location}
              </p>
              <p style={styles.jobMeta}>
                <FiCalendar style={styles.jobMetaIcon} /> Publicada em {new Date(job.postedAt).toLocaleDateString('pt-BR')}
              </p>
            </div>
            <div style={styles.jobCardActions}>
              <button style={styles.applyButton}>
                Candidatar-se <FiArrowRight style={{ marginLeft: '0.5rem' }} />
              </button>
              <button style={styles.saveButton}>
                <FiBookmark style={{ marginRight: '0.5rem' }} /> Salvar
              </button>
            </div>
          </div>
        ))}
      </div>
      {isModalOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h2 style={styles.modalTitle}>Adicionar Nova Vaga</h2>
            <p style={styles.modalText}>
              A funcionalidade de adicionar novas vagas será implementada em breve. Fique ligado!
            </p>
            <button onClick={() => setIsModalOpen(false)} style={styles.modalCloseButton}>
              Entendi
            </button>
          </div>
        </div>
      )}
    </section>
  );
}