import React, { useState, useEffect } from "react";
import {
  FiPlus,
  FiBriefcase,
  FiMapPin,
  FiCalendar,
  FiBookmark,
  FiX,
  FiTrash2 
} from "react-icons/fi";
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, deleteDoc, doc } from "firebase/firestore"; // Importa deleteDoc e doc
import { db } from "../services/firebase"; 
import useAuthStore from '../store/useAuth'; 

// Variável de cor para o label (assumindo que você usa essa paleta)
const FONT_COLOR_DARK = "#1A1A1A";

export default function Jobs() {
  const { user, profileData } = useAuthStore(); 
  const isEmpresa = profileData?.tipoUsuario === 'empresa';
  const isCandidato = profileData?.tipoUsuario === 'pcd' || profileData?.tipoUsuario === 'Usuário Individual'; 

  const [jobs, setJobs] = useState([]);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [view, setView] = useState("explorar");
  const [filterDeficiencia, setFilterDeficiencia] = useState("todas"); 
  const [newJob, setNewJob] = useState({ title: "", company: "", location: "", deficiencia: "" });
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // Inclui 'Qualquer' na lista para o modal e filtro
  const tiposDeficiencia = ['Visual', 'Auditiva', 'Fisica', 'Intelectual', 'Múltipla', 'Outra', 'Qualquer'];

  // Busca de vagas em tempo real
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

  // Local Storage e Resizing (mantido o padrão)
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

  const handleApply = async (job) => {
    if (!user || !isCandidato) {
        alert("Você precisa estar logado como Candidato (PCD ou Individual) para se candidatar!");
        return;
    }

    const isApplied = appliedJobs.some((j) => j.id === job.id);

    if (isApplied) {
        setAppliedJobs((prev) => prev.filter((j) => j.id !== job.id));
        return;
    } 

    setAppliedJobs((prev) => [...prev, job]);

    if (job.empresaUid) {
        try {
            await addDoc(collection(db, 'notifications'), {
                recipientUid: job.empresaUid, 
                senderUid: user.uid, 
                senderName: profileData.nome || user.displayName || 'Novo Candidato',
                type: 'application',
                message: `${profileData.nome || 'Um candidato'} se inscreveu na vaga: ${job.title}`,
                jobTitle: job.title,
                createdAt: serverTimestamp(), 
                read: false,
            });
        } catch (error) {
            console.error("Erro ao enviar notificação de candidatura:", error);
        }
    }
  };

  const handleSave = (job) => {
    if (!isCandidato) return; // Só permite salvar se for um candidato
    if (savedJobs.some((j) => j.id === job.id)) {
      setSavedJobs((prev) => prev.filter((j) => j.id !== job.id));
    } else {
      setSavedJobs((prev) => [...prev, job]);
    }
  };

  const handleDeleteJob = async (jobId, jobEmpresaUid) => {
    if (!user || !isEmpresa || user.uid !== jobEmpresaUid) {
        alert("Você não tem permissão para excluir esta vaga.");
        return;
    }

    if (window.confirm("Tem certeza que deseja remover esta vaga?")) {
        try {
            await deleteDoc(doc(db, "vagas", jobId));
            // A atualização do estado 'jobs' é tratada automaticamente pelo onSnapshot
            alert("Vaga excluída com sucesso!");
        } catch (error) {
            console.error("Erro ao excluir vaga:", error);
            alert("Erro ao excluir a vaga.");
        }
    }
  };

  const handleAddJob = async () => {
    if (!newJob.title || !newJob.company || !newJob.location || !newJob.deficiencia) {
        alert("Preencha todos os campos.");
        return;
    }
    
    if (!user || profileData?.tipoUsuario !== 'empresa') {
        alert("Você precisa estar logado como Empresa para adicionar vagas.");
        return;
    }

    try {
      await addDoc(collection(db, "vagas"), {
        title: newJob.title,
        company: newJob.company,
        location: newJob.location,
        // Garante que o valor salvo é em minúsculas
        deficiencia: newJob.deficiencia.toLowerCase(), 
        empresaUid: user.uid, 
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
    
    let filteredList = listToFilter;

    // 1. Filtro de Empresa (apenas vê as próprias vagas)
    if (isEmpresa && user) {
        filteredList = listToFilter.filter(job => job.empresaUid === user.uid);
    }
    
    // 2. Lógica de Filtro Aprimorada
    const filterValue = filterDeficiencia.toLowerCase();

    if (filterValue === "todas") {
        // 'Todas as Vagas': Retorna a lista completa
        return filteredList;
    } 
    
    if (filterValue === "qualquer") {
        // 'Qualquer um': Retorna apenas vagas marcadas como 'qualquer'
        return filteredList.filter(job => job.deficiencia === 'qualquer');
    }
    
    // Filtro por Deficiência Específica (o valor é a deficiência, ex: 'visual')
    // AQUI: Apenas vagas com aquela deficiência específica são mostradas.
    return filteredList.filter(job => job.deficiencia === filterValue);
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
    buttonRow: { display: "flex", flexDirection: isMobile ? "column" : "row", gap: "0.5rem", alignItems: 'center', marginTop: '0.5rem' },
    primaryBtn: { flex: 1, background: "#E53E3E", color: "white", border: "none", borderRadius: "6px", padding: "0.5rem 1rem", cursor: "pointer", fontWeight: "600" },
    secondaryBtn: { flex: 1, background: "transparent", color: "#E53E3E", border: "1px solid #E53E3E", borderRadius: "6px", padding: "0.5rem 1rem", cursor: "pointer", fontWeight: "600" },
    deleteBtn: { background: "#e53e3e", color: "white", border: "none", borderRadius: "6px", padding: "0.5rem 1rem", cursor: "pointer", fontWeight: "600", width: '100%' }, // Estilo para o botão de exclusão
    filterSelect: { padding: "0.5rem", borderRadius: "6px", border: "1px solid #E53E3E", marginBottom: "1rem", width: "100%", textAlign: "center" }
  };

  // Função auxiliar para exibir a deficiência
  const formatDeficiencia = (deficiencia) => {
    if (deficiencia === 'qualquer') return 'Qualquer Deficiência / Público Geral';
    return deficiencia.charAt(0).toUpperCase() + deficiencia.slice(1);
  };

  return (
    <section style={styles.container}>
      <div style={styles.header}>
        <h1 style={{ fontSize: "2rem", color: "#E53E3E", textAlign: isMobile ? "center" : "left" }}>Vagas</h1>
        <div style={styles.navButtons}>
          <button style={styles.navButton(view === "explorar")} onClick={() => setView("explorar")}>
             {isEmpresa ? "Minhas Vagas" : "Explorar"}
          </button>
          {isCandidato && <button style={styles.navButton(view === "candidatadas")} onClick={() => setView("candidatadas")}>Candidatadas</button>}
          {isCandidato && <button style={styles.navButton(view === "salvas")} onClick={() => setView("salvas")}>Salvas</button>}
          {isEmpresa && <button style={styles.navButton(false)} onClick={() => setIsModalOpen(true)}><FiPlus /> Adicionar Vaga</button>}
        </div>
      </div>
      
      {/* SELETOR DE FILTRO */}
      {!isEmpresa && ( // O filtro é mais relevante para o Candidato, não para a listagem da Empresa
        <select 
          style={styles.filterSelect} 
          onChange={(e) => setFilterDeficiencia(e.target.value)} 
          value={filterDeficiencia}
        >
            {/* 1. OPÇÃO PLACEHOLDER (EM NEGRITO E DESABILITADA) */}
            <option value="todas" disabled style={{ fontWeight: 'bold' }}>Filtrar por Candidato</option>
            
            {/* Opção para ver TODAS as vagas, independentemente do tipo */}
            <option value="todas">Todas as Vagas</option>

            {/* Opção para ver APENAS as vagas para o público geral/Qualquer Pessoa */}
            <option value="qualquer">Qualquer pessoa (Público Geral)</option>
            
            {/* 2. GRUPO: FILTRAR POR DEFICIÊNCIA ESPECÍFICA */}
            <optgroup label="Filtrar por Deficiência Específica">
                {/* Mapeia apenas os tipos de deficiência específicos */}
                {tiposDeficiencia
                    .filter(t => t !== 'Qualquer')
                    .map(tipo => (
                    <option key={tipo} value={tipo.toLowerCase()}>{tipo}</option>
                ))}
            </optgroup>
        </select>
      )}

      <div style={styles.jobsGrid}>
        {displayedJobs.length === 0 ? (
          <p style={{ textAlign: "center", color: "#E53E3E", gridColumn: "1 / -1" }}>Nenhuma vaga encontrada.</p>
        ) : (
          displayedJobs.map((job) => {
            const isApplied = appliedJobs.some((j) => j.id === job.id);
            const isSaved = savedJobs.some((j) => j.id === job.id);
            const postedAtDate = job.postedAt?.toDate ? job.postedAt.toDate() : new Date();
            const canDelete = isEmpresa && user && job.empresaUid === user.uid;

            return (
              <div key={job.id} style={styles.jobCard}>
                <h3 style={{ margin: 0, color: "#E53E3E" }}>{job.title}</h3>
                <p><FiBriefcase /> **{job.company}**</p>
                <p><FiMapPin /> {job.location}</p>
                <p><FiCalendar /> Publicada em {postedAtDate.toLocaleDateString("pt-BR")}</p>
                <p style={{ fontWeight: 'bold' }}>Público Alvo: {formatDeficiencia(job.deficiencia)}</p>
                
                {/* Botões para Candidato */}
                {!isEmpresa && (
                  <div style={styles.buttonRow}>
                    <button onClick={() => handleApply(job)} style={styles.primaryBtn}>
                      {isApplied ? <><FiX style={{ marginRight: "0.3rem" }} /> Cancelar</> : "Candidatar-se"}
                    </button>
                    <button onClick={() => handleSave(job)} style={styles.secondaryBtn}>
                      <FiBookmark style={{ marginRight: "0.3rem" }} /> {isSaved ? "Remover" : "Salvar"}
                    </button>
                  </div>
                )}
                
                {/* Botão de Excluir Vaga (Apenas para a Empresa criadora) */}
                {canDelete && (
                    <button 
                        onClick={() => handleDeleteJob(job.id, job.empresaUid)} 
                        style={styles.deleteBtn}
                    >
                        <FiTrash2 style={{ marginRight: "0.3rem" }} /> Excluir Vaga
                    </button>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* MODAL DE ADICIONAR VAGA */}
      {isModalOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h2 style={{ textAlign: "center", color: "#E53E3E" }}>Adicionar Nova Vaga</h2>
            <input style={styles.input} type="text" placeholder="Título" value={newJob.title} onChange={(e) => setNewJob((prev) => ({ ...prev, title: e.target.value }))} />
            <input style={styles.input} type="text" placeholder="Empresa" value={newJob.company} onChange={(e) => setNewJob((prev) => ({ ...prev, company: e.target.value }))} />
            <input style={styles.input} type="text" placeholder="Localização" value={newJob.location} onChange={(e) => setNewJob((prev) => ({ ...prev, location: e.target.value }))} />
            
            {/* SELECT HIERÁRQUICO (Modal) */}
            <label style={{ color: FONT_COLOR_DARK, fontSize: '0.9rem', fontWeight: '600', marginBottom: '-0.5rem' }}>
                Que tipo de candidato você busca?
            </label>
            <select style={styles.input} value={newJob.deficiencia} onChange={(e) => setNewJob((prev) => ({ ...prev, deficiencia: e.target.value }))}>
                
                {/* OPÇÃO PLACEHOLDER (EM NEGRITO E DESABILITADA) */}
                <option value="" disabled style={{ fontWeight: 'bold' }}>Selecione o Público Alvo</option>
                
                {/* OPÇÃO: QUALQUER PESSOA (Público Geral) */}
                <option value="qualquer">Qualquer pessoa</option>
                
                {/* GRUPO: CANDIDATO DEFICIENTE (PCD) */}
                <optgroup label="Candidato Deficiente" >
                    {tiposDeficiencia
                        .filter(tipo => tipo !== 'Qualquer')
                        .map(tipo => (
                        <option key={tipo} value={tipo.toLowerCase()}>{tipo}</option>
                    ))}
                </optgroup>

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