import React, { useState, useEffect } from "react";
import {
  FiPlus,
  FiBriefcase,
  FiMapPin,
  FiCalendar,
  FiBookmark,
  FiX,
} from "react-icons/fi";

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [view, setView] = useState("explorar");
  const [newJob, setNewJob] = useState({ title: "", company: "", location: "" });
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  const defaultJobs = [
    { id: 1, title: "Desenvolvedor(a) Front-end Pleno", company: "Tech Solutions Inc.", location: "Lisboa, Portugal", postedAt: "2024-10-26T10:00:00Z" },
    { id: 2, title: "Analista de Dados Júnior", company: "Data Insight Ltd.", location: "Porto, Portugal", postedAt: "2024-10-25T15:30:00Z" },
    { id: 3, title: "Designer UI/UX Sênior", company: "Creative Hub Studios", location: "Remoto", postedAt: "2024-10-24T09:15:00Z" },
    { id: 4, title: "Gerente de Projeto Agile", company: "Project Masters SA", location: "Braga, Portugal", postedAt: "2024-10-23T11:45:00Z" },
  ];

  // Carrega do localStorage
  useEffect(() => {
    setJobs(JSON.parse(localStorage.getItem("jobs")) || defaultJobs);
    setAppliedJobs(JSON.parse(localStorage.getItem("appliedJobs")) || []);
    setSavedJobs(JSON.parse(localStorage.getItem("savedJobs")) || []);
  }, []);

  // Salva no localStorage
  useEffect(() => localStorage.setItem("jobs", JSON.stringify(jobs)), [jobs]);
  useEffect(() => localStorage.setItem("appliedJobs", JSON.stringify(appliedJobs)), [appliedJobs]);
  useEffect(() => localStorage.setItem("savedJobs", JSON.stringify(savedJobs)), [savedJobs]);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleApply = (job) => {
    if (appliedJobs.some((j) => j.id === job.id)) {
      // Se já está candidatado → remove
      setAppliedJobs((prev) => prev.filter((j) => j.id !== job.id));
    } else {
      // Se não está → adiciona
      setAppliedJobs((prev) => [...prev, job]);
    }
  };

  const handleSave = (job) => {
    if (savedJobs.some((j) => j.id === job.id)) {
      // Se já está salvo → remove
      setSavedJobs((prev) => prev.filter((j) => j.id !== job.id));
    } else {
      // Se não está → adiciona
      setSavedJobs((prev) => [...prev, job]);
    }
  };

  const handleAddJob = () => {
    if (!newJob.title || !newJob.company || !newJob.location) return;
    const newJobData = { id: Date.now(), title: newJob.title, company: newJob.company, location: newJob.location, postedAt: new Date().toISOString() };
    setJobs((prev) => [...prev, newJobData]);
    setNewJob({ title: "", company: "", location: "" });
    setIsModalOpen(false);
  };

  const displayedJobs = view === "explorar" ? jobs : view === "candidatadas" ? appliedJobs : savedJobs;

  const isMobile = windowWidth < 768;

  const styles = {
    container: {
      padding: "1rem",
      maxWidth: "1200px",
      margin: "0 auto",
    },
    header: {
      display: "flex",
      flexDirection: isMobile ? "column" : "row",
      justifyContent: "space-between",
      alignItems: isMobile ? "stretch" : "center",
      marginBottom: "1rem",
      gap: isMobile ? "0.5rem" : "0",
      borderBottom: "1px solid #E53E3E",
      paddingBottom: "0.5rem",
    },
    navButtons: {
      display: "flex",
      flexWrap: "wrap",
      gap: "0.5rem",
      justifyContent: isMobile ? "center" : "flex-end",
    },
    navButton: (active) => ({
      padding: "0.4rem 0.8rem",
      borderRadius: "8px",
      border: "1px solid #E53E3E",
      background: active ? "#E53E3E" : "transparent",
      color: active ? "white" : "#E53E3E",
      cursor: "pointer",
      fontWeight: "600",
      flex: isMobile ? "1" : "none",
      textAlign: "center",
    }),
    jobsGrid: {
      display: "grid",
      gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)",
      gap: "1rem",
    },
    jobCard: {
      border: "1px solid #E53E3E",
      borderRadius: "10px",
      padding: "1rem",
      background: "#fff5f5",
    },
    modalOverlay: {
      position: "fixed",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      backgroundColor: "rgba(229, 62, 62, 0.1)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1000,
      padding: "1rem",
    },
    modalContent: {
      backgroundColor: "#fff",
      padding: "1.5rem",
      borderRadius: "10px",
      boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
      width: "100%",
      maxWidth: "400px",
      display: "flex",
      flexDirection: "column",
      gap: "0.75rem",
    },
    input: {
      padding: "0.5rem",
      border: "1px solid #E53E3E",
      borderRadius: "6px",
    },
    buttonRow: {
      display: "flex",
      flexDirection: isMobile ? "column" : "row",
      gap: "0.5rem",
    },
    primaryBtn: {
      flex: 1,
      background: "#E53E3E",
      color: "white",
      border: "none",
      borderRadius: "6px",
      padding: "0.5rem 1rem",
      cursor: "pointer",
      fontWeight: "600",
    },
    secondaryBtn: {
      flex: 1,
      background: "transparent",
      color: "#E53E3E",
      border: "1px solid #E53E3E",
      borderRadius: "6px",
      padding: "0.5rem 1rem",
      cursor: "pointer",
      fontWeight: "600",
    },
  };

  return (
    <section style={styles.container}>
      <div style={styles.header}>
        <h1 style={{ fontSize: "2rem", color: "#E53E3E", textAlign: isMobile ? "center" : "left" }}>Vagas</h1>
        <div style={styles.navButtons}>
          <button style={styles.navButton(view === "explorar")} onClick={() => setView("explorar")}>Explorar</button>
          <button style={styles.navButton(view === "candidatadas")} onClick={() => setView("candidatadas")}>Candidatadas</button>
          <button style={styles.navButton(view === "salvas")} onClick={() => setView("salvas")}>Salvas</button>
          <button style={styles.navButton(false)} onClick={() => setIsModalOpen(true)}><FiPlus /></button>
        </div>
      </div>

      <div style={styles.jobsGrid}>
        {displayedJobs.length === 0 ? (
          <p style={{ textAlign: "center", color: "#E53E3E" }}>Nenhuma vaga aqui ainda.</p>
        ) : (
          displayedJobs.map((job) => {
            const isApplied = appliedJobs.some((j) => j.id === job.id);
            const isSaved = savedJobs.some((j) => j.id === job.id);

            return (
              <div key={job.id} style={styles.jobCard}>
                <h3 style={{ margin: 0, color: "#E53E3E" }}>{job.title}</h3>
                <p><FiBriefcase /> {job.company}</p>
                <p><FiMapPin /> {job.location}</p>
                <p><FiCalendar /> Publicada em {new Date(job.postedAt).toLocaleDateString("pt-BR")}</p>
                <div style={styles.buttonRow}>
                  <button onClick={() => handleApply(job)} style={styles.primaryBtn}>
                    {isApplied ? <><FiX style={{ marginRight: "0.3rem" }} /> Cancelar</> : "Candidatar-se"}
                  </button>
                  <button onClick={() => handleSave(job)} style={styles.secondaryBtn}>
                    <FiBookmark style={{ marginRight: "0.3rem" }} /> {isSaved ? "Remover" : "Salvar"}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {isModalOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h2 style={{ textAlign: "center", color: "#E53E3E" }}>Adicionar Nova Vaga</h2>
            <input style={styles.input} type="text" placeholder="Título" value={newJob.title} onChange={(e) => setNewJob((prev) => ({ ...prev, title: e.target.value }))} />
            <input style={styles.input} type="text" placeholder="Empresa" value={newJob.company} onChange={(e) => setNewJob((prev) => ({ ...prev, company: e.target.value }))} />
            <input style={styles.input} type="text" placeholder="Localização" value={newJob.location} onChange={(e) => setNewJob((prev) => ({ ...prev, location: e.target.value }))} />
            <div style={styles.buttonRow}>
              <button style={styles.primaryBtn} onClick={handleAddJob}>Adicionar</button>
              <button style={styles.secondaryBtn} onClick={() => setIsModalOpen(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
  