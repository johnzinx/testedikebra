import React, { useState, useEffect } from 'react';

export default function Jobs() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  const breakpoint = 768; // Defina o ponto de quebra aqui

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const mockJobs = [
    { id: 1, title: "Desenvolvedor(a) Front-end Pleno", company: "Tech Solutions Inc.", location: "Lisboa, Portugal", postedAt: "2024-10-26T10:00:00Z" },
    { id: 2, title: "Analista de Dados Júnior", company: "Data Insight Ltd.", location: "Porto, Portugal", postedAt: "2024-10-25T15:30:00Z" },
    { id: 3, title: "Designer UI/UX Sênior", company: "Creative Hub Studios", location: "Remoto", postedAt: "2024-10-24T09:15:00Z" },
    { id: 4, title: "Gerente de Projeto Agile", company: "Project Masters SA", location: "Braga, Portugal", postedAt: "2024-10-23T11:45:00Z" },
    { id: 5, title: "Especialista em Marketing Digital", company: "WebBoost Ventures", location: "Faro, Portugal", postedAt: "2024-10-22T14:20:00Z" },
    { id: 6, title: "Desenvolvedor(a) Back-end", company: "Code Creators", location: "Lisboa, Portugal", postedAt: "2024-10-21T18:00:00Z" },
  ];

  const styles = {
    jobsSection: {
      padding: windowWidth > breakpoint ? '2rem 4rem' : '1rem',
      backgroundColor: '#f3f4f6',
      minHeight: '100vh',
      fontFamily: 'sans-serif',
      color: '#374151',
      maxWidth: windowWidth > breakpoint ? '1000px' : '100%',
      margin: '0 auto',
    },
    titleContainer: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '1.5rem',
    },
    titleText: {
      fontSize: windowWidth > breakpoint ? '2.25rem' : '1.75rem',
      fontWeight: 'bold',
    },
    addButton: {
      background: 'linear-gradient(45deg, #f472b6, #fb7185)',
      border: 'none',
      borderRadius: '9999px',
      color: 'white',
      cursor: 'pointer',
      height: windowWidth > breakpoint ? '50px' : '40px',
      width: windowWidth > breakpoint ? '50px' : '40px',
      fontSize: windowWidth > breakpoint ? '2.5rem' : '2rem',
      lineHeight: '1',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
      transform: 'rotate(0deg)',
    },
    categoriesContainer: {
      marginBottom: '2rem',
    },
    categoriesLineContainer: {
      display: 'flex',
      alignItems: 'center',
    },
    line: {
      flexGrow: 1,
      borderTop: '2px dashed #f472b6',
    },
    categoriesLabel: {
      backgroundColor: '#f472b6',
      color: 'white',
      fontWeight: 'bold',
      padding: '4px 16px',
      borderRadius: '9999px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
      margin: '0 1rem',
      fontSize: windowWidth > breakpoint ? '1rem' : '0.875rem',
    },
    recentJobsContainer: {
      position: 'relative',
      marginBottom: '2rem',
    },
    recentHeader: {
      position: 'absolute',
      top: '-1rem',
      left: '1rem',
      backgroundColor: '#3b82f6',
      color: 'white',
      fontWeight: 'bold',
      padding: '4px 16px',
      borderRadius: '9999px',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
      fontSize: windowWidth > breakpoint ? '1rem' : '0.875rem',
    },
    recentCardsWrapper: {
      position: 'relative',
      backgroundColor: 'white',
      borderRadius: '1rem',
      padding: '1.5rem',
      paddingTop: '3rem',
      border: '2px solid #3b82f6',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
      overflow: 'hidden',
    },
    recentCardsScroll: {
      display: 'flex',
      gap: '1rem',
      overflowX: 'auto',
      paddingBottom: '1rem',
      MsOverflowStyle: 'none',
      scrollbarWidth: 'none',
    },
    categoryCard: {
      minWidth: '200px',
      flexShrink: 0,
      backgroundColor: '#e5e7eb',
      borderRadius: '12px',
      padding: '16px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
    },
    scrollButton: {
      position: 'absolute',
      right: '0',
      top: '50%',
      transform: 'translateY(-50%)',
      color: '#3b82f6',
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
      borderRadius: '9999px',
      padding: '8px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
      border: 'none',
      cursor: 'pointer',
      display: windowWidth > breakpoint ? 'block' : 'none',
    },
    jobList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
    },
    jobCard: {
      backgroundColor: 'white',
      padding: '24px',
      borderRadius: '16px',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
      borderLeft: '4px solid #60a5fa',
    },
    jobCardTitle: {
      fontSize: windowWidth > breakpoint ? '1.5rem' : '1.25rem',
      fontWeight: 'bold',
      color: '#1f2937',
    },
    jobCardText: {
      color: '#6b7280',
      margin: '4px 0',
      fontSize: windowWidth > breakpoint ? '1rem' : '0.875rem',
    },
    jobCardDate: {
      color: '#9ca3af',
      fontSize: windowWidth > breakpoint ? '0.875rem' : '0.75rem',
    },
    jobCardButtons: {
      marginTop: '1rem',
      display: 'flex',
      flexDirection: windowWidth > 480 ? 'row' : 'column',
      gap: '8px',
    },
    buttonPrimary: {
      flex: 1,
      padding: '8px 16px',
      backgroundColor: '#3b82f6',
      color: 'white',
      borderRadius: '9999px',
      fontWeight: 'bold',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
      border: 'none',
      cursor: 'pointer',
    },
    buttonOutline: {
      flex: 1,
      padding: '8px 16px',
      backgroundColor: 'transparent',
      border: '2px solid #3b82f6',
      color: '#3b82f6',
      borderRadius: '9999px',
      fontWeight: 'bold',
      cursor: 'pointer',
    },
    modal: {
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      backgroundColor: 'white',
      padding: '2rem',
      borderRadius: '1rem',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
      zIndex: 100,
      width: '90%',
      maxWidth: '400px',
      textAlign: 'center',
      border: '1px solid #e5e7eb',
    },
    backdrop: {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      zIndex: 99,
    },
    modalTitle: {
      fontSize: '1.25rem',
      fontWeight: 'bold',
      marginBottom: '1rem',
    },
    modalButton: {
      marginTop: '1.5rem',
      padding: '8px 16px',
      backgroundColor: '#3b82f6',
      color: 'white',
      borderRadius: '9999px',
      fontWeight: 'bold',
      border: 'none',
      cursor: 'pointer',
    },
  };

  return (
    <section style={styles.jobsSection}>
      <div style={styles.titleContainer}>
        <h1 style={styles.titleText}>Vagas</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          style={styles.addButton}
          onMouseOver={e => e.currentTarget.style.transform = 'rotate(90deg)'}
          onMouseOut={e => e.currentTarget.style.transform = 'rotate(0deg)'}
        >
          +
        </button>
      </div>

      <div style={styles.categoriesContainer}>
        <div style={styles.categoriesLineContainer}>
          <hr style={styles.line} />
          <h2 style={styles.categoriesLabel}>Categorias</h2>
          <hr style={styles.line} />
        </div>
      </div>

      <div style={styles.recentJobsContainer}>
        <h2 style={styles.recentHeader}>
          Registrados Recentemente
        </h2>
        <div style={styles.recentCardsWrapper}>
          <div style={styles.recentCardsScroll}>
            {mockJobs.slice(0, 5).map(job => (
              <div key={job.id} style={styles.categoryCard}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '600', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{job.title}</h3>
                <p style={{ fontSize: '0.875rem', color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{job.company}</p>
                <p style={{ fontSize: '0.875rem', color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{job.location}</p>
              </div>
            ))}
          </div>
          <button style={styles.scrollButton}>
            <svg xmlns="http://www.w3.org/2000/svg" style={{ height: '32px', width: '32px' }} viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>

      <div style={styles.jobList}>
        {mockJobs.map(job => (
          <div key={job.id} style={styles.jobCard}>
            <h3 style={styles.jobCardTitle}>{job.title}</h3>
            <p style={styles.jobCardText}>{job.company} • {job.location}</p>
            <small style={styles.jobCardDate}>Publicada em {new Date(job.postedAt).toLocaleDateString('pt-BR')}</small>
            <div style={styles.jobCardButtons}>
              <button style={styles.buttonPrimary}>
                Candidatar-se
              </button>
              <button style={styles.buttonOutline}>
                Salvar
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {isModalOpen && (
        <>
          <div style={styles.backdrop} onClick={() => setIsModalOpen(false)}></div>
          <div style={styles.modal}>
            <h2 style={styles.modalTitle}>Adicionar Vaga</h2>
            <p>Em breve você poderá adicionar uma nova vaga aqui!</p>
            <button onClick={() => setIsModalOpen(false)} style={styles.modalButton}>
              Fechar
            </button>
          </div>
        </>
      )}
    </section>
  );
}