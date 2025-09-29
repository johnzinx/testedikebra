import React, { useState, useEffect } from "react";
import {
  FiPlus,
  FiBriefcase,
  FiMapPin,
  FiCalendar,
  FiBookmark,
  FiX,
} from "react-icons/fi";
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp } from "firebase/firestore";
import { db } from "../services/firebase"; // Certifique-se de que o 'db' está exportado em services/firebase.js
import useAuth from '../store/useAuth';

export default function Jobs() {
  const { profileData } = useAuth();
  const isEmpresa = profileData?.tipoUsuario === 'empresa';

  const [jobs, setJobs] = useState([]);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [view, setView] = useState("explorar");
  const [filterDeficiencia, setFilterDeficiencia] = useState("todas");
  const [newJob, setNewJob] = useState({ title: "", company: "", location: "", deficiencia: "" });
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  const tiposDeficiencia = ['Visual', 'Auditiva', 'Fisica', 'Intelectual', 'Múltipla', 'Outra'];

  // vagas em tempo real no react
  useEffect(() => {
    const q = query(collection(db, "vagas"), orderBy("postedAt", "desc"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const vagasData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setJobs(vagasData);
    }, (error) => {
      console.error("Erro ao buscar vagas: ", error);
    });

    return () => unsubscribe();
  }, []);

  // salva as vagas no localstorage
  useEffect(() => {
    setAppliedJobs(JSON.parse(localStorage.getItem("appliedJobs")) || []);
    setSavedJobs(JSON.parse(localStorage.getItem("savedJobs")) || []);
  }, []);

  useEffect(() => localStorage.setItem("appliedJobs", JSON.stringify(appliedJobs)), [appliedJobs]);
  useEffect(() => localStorage.setItem("savedJobs", JSON.stringify(savedJobs)), [savedJobs]);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleApply = (job) => {
    if (appliedJobs.some((j) => j.id === job.id)) {
      setAppliedJobs((prev) => prev.filter((j) => j.id !== job.id));
    } else {
      setAppliedJobs((prev) => [...prev, job]);
    }
  };

  const handleSave = (job) => {
    if (savedJobs.some((j) => j.id === job.id)) {
      setSavedJobs((prev) => prev.filter((j) => j.id !== job.id));
    } else {
      setSavedJobs((prev) => [...prev, job]);
    }
  };

  // add a vaga no firestore
  const handleAddJob = async () => {
    if (!newJob.title || !newJob.company || !newJob.location || !newJob.deficiencia) return;
    
    try {
      await addDoc(collection(db, "vagas"), {
        title: newJob.title,
        company: newJob.company,
        location: newJob.location,
        deficiencia: newJob.deficiencia,
        postedAt: serverTimestamp(), 
      });
      setNewJob({ title: "", company: "", location: "", deficiencia: "" });
      setIsModalOpen(false);
    } catch (e) {
      console.error("Erro ao adicionar documento: ", e);
    }
  };
  
  const getFilteredJobs = () => {
    const listToFilter = view === "explorar" ? jobs : view === "candidatadas" ? appliedJobs : savedJobs;
    
    if (filterDeficiencia === "todas") {
      return listToFilter;
    }

    return listToFilter.filter(job => job.deficiencia === filterDeficiencia);
  }

  const displayedJobs = getFilteredJobs();
  const isMobile = windowWidth < 768;

  const styles = {
    container: { padding: "1rem", maxWidth: "1200px", margin: "0 auto" },
    header: { display: "flex", flexDirection: isMobile ? "column" : "row", justifyContent: "space-between", alignItems: isMobile ? "stretch" : "center", marginBottom: "1rem", gap: isMobile ? "0.5rem" : "0", borderBottom: "1px solid #E53E3E", paddingBottom: "0.5rem" },
    navButtons: { display: "flex", flexWrap: "wrap", gap: "0.5rem", justifyContent: isMobile ? "center" : "flex-end" },
    navButton: (active) => ({ padding: "0.4rem 0.8rem", borderRadius: "8px", border: "1px solid #E53E3E", background: active ? "#E53E3E" : "transparent", color: active ? "white" : "#E53E3E", cursor: "pointer", fontWeight: "600", flex: isMobile ? "1" : "none", textAlign: "center" }),
    jobsGrid: { display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)", gap: "1rem" },
    jobCard: { border: "1px solid #E53E3E", borderRadius: "10px", padding: "1rem", background: "#fff5f5" },
    modalOverlay: { position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", backgroundColor: "rgba(229, 62, 62, 0.1)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000, padding: "1rem" },
    modalContent: { backgroundColor: "#fff", padding: "1.5rem", borderRadius: "10px", boxShadow: "0 10px 30px rgba(0,0,0,0.2)", width: "100%", maxWidth: "400px", display: "flex", flexDirection: "column", gap: "0.75rem" },
    input: { padding: "0.5rem", border: "1px solid #E53E3E", borderRadius: "6px" },
    buttonRow: { display: "flex", flexDirection: isMobile ? "column" : "row", gap: "0.5rem" },
    primaryBtn: { flex: 1, background: "#E53E3E", color: "white", border: "none", borderRadius: "6px", padding: "0.5rem 1rem", cursor: "pointer", fontWeight: "600" },
    secondaryBtn: { flex: 1, background: "transparent", color: "#E53E3E", border: "1px solid #E53E3E", borderRadius: "6px", padding: "0.5rem 1rem", cursor: "pointer", fontWeight: "600" },
    filterSelect: { padding: "0.5rem", borderRadius: "6px", border: "1px solid #E53E3E", marginBottom: "1rem", width: "100%", textAlign: "center" }
  };

  return (
    <section style={styles.container}>
      <div style={styles.header}>
        <h1 style={{ fontSize: "2rem", color: "#E53E3E", textAlign: isMobile ? "center" : "left" }}>Vagas</h1>
        <div style={styles.navButtons}>
          <button style={styles.navButton(view === "explorar")} onClick={() => setView("explorar")}>Explorar</button>
          <button style={styles.navButton(view === "candidatadas")} onClick={() => setView("candidatadas")}>Candidatadas</button>
          <button style={styles.navButton(view === "salvas")} onClick={() => setView("salvas")}>Salvas</button>
          {isEmpresa && <button style={styles.navButton(false)} onClick={() => setIsModalOpen(true)}><FiPlus /></button>}
        </div>
      </div>
      
      <select style={styles.filterSelect} onChange={(e) => setFilterDeficiencia(e.target.value)} value={filterDeficiencia}>
          <option value="todas">Filtrar por Deficiência (Todas)</option>
          {tiposDeficiencia.map(tipo => (
              <option key={tipo} value={tipo.toLowerCase()}>{tipo}</option>
          ))}
      </select>

      <div style={styles.jobsGrid}>
        {displayedJobs.length === 0 ? (
          <p style={{ textAlign: "center", color: "#E53E3E" }}>Nenhuma vaga encontrada.</p>
        ) : (
          displayedJobs.map((job) => {
            const isApplied = appliedJobs.some((j) => j.id === job.id);
            const isSaved = savedJobs.some((j) => j.id === job.id);
            const postedAtDate = job.postedAt?.toDate ? job.postedAt.toDate() : new Date();

            return (
              <div key={job.id} style={styles.jobCard}>
                <h3 style={{ margin: 0, color: "#E53E3E" }}>{job.title}</h3>
                <p><FiBriefcase /> {job.company}</p>
                <p><FiMapPin /> {job.location}</p>
                <p><FiCalendar /> Publicada em {postedAtDate.toLocaleDateString("pt-BR")}</p>
                <p style={{ fontWeight: 'bold' }}>Deficiência: {job.deficiencia.charAt(0).toUpperCase() + job.deficiencia.slice(1)}</p>
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
            <select style={styles.input} value={newJob.deficiencia} onChange={(e) => setNewJob((prev) => ({ ...prev, deficiencia: e.target.value }))}>
                <option value="">Selecione a Deficiência Alvo</option>
                {tiposDeficiencia.map(tipo => (
                    <option key={tipo} value={tipo.toLowerCase()}>{tipo}</option>
                ))}
            </select>
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