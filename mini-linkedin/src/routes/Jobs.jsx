import React, { useState, useEffect, useMemo } from "react";
import {
    FiPlus,
    FiBriefcase,
    FiMapPin,
    FiCalendar,
    FiBookmark,
    FiX,
    FiTarget,
    FiDollarSign,
    FiGlobe,
    FiLayers,
    FiFileText,
    FiEdit3,
    FiTrash2, 
    FiZap, 
} from "react-icons/fi";
import { 
    collection, 
    addDoc, 
    onSnapshot, 
    query, 
    orderBy, 
    serverTimestamp,
    doc, 
    deleteDoc 
} from "firebase/firestore";
import { db } from "../services/firebase";
import useAuthStore from '../store/useAuth'; 

// 1. CONSTANTES DE ESTILO E DADOS
const FONT_COLOR_DARK = "#1A1A1A";       
const ACCENT_COLOR = "#CF0908";           
const PRIMARY_COLOR = ACCENT_COLOR;      
const CARD_BACKGROUND = "#FFFFFF";
const LIGHT_BACKGROUND = "#ECECEC"; 
const BORDER_COLOR = "#D9D9D9"; 
const SHADOW_LIGHT = "0 6px 10px rgba(0,0,0,0.08)"; 
const SUCCESS_COLOR = "#48BB78"; 
const CANCEL_COLOR = "#E53E3E"; 
const SUCCESS_BACKGROUND = "#E6FFFA";

// Constantes de Dados
const RAMOS_ATUACAO = ['Tecnologia', 'Saúde', 'Finanças', 'Educação', 'Varejo', 'Serviços', 'Indústria', 'Outro'];
const EXPERIENCIA_OPCOES = ['Estágio', 'Júnior', 'Pleno', 'Sênior', 'Especialista'];
const MODALIDADES = ['Remoto', 'Presencial', 'Híbrido'];
const TIPOS_DEFICIENCIA_MODAL = ['Visual', 'Auditiva', 'Fisica', 'Intelectual', 'Múltipla', 'Outra', 'Qualquer'];

const INITIAL_NEW_JOB_STATE = {
    title: "",
    company: "",
    location: "",
    deficiencia: "",
    description: "",
    salary: "",
    ramo: "",
    experience: "",
    modalidade: "",
    empresaNome: "",
};

// =========================================================================
// 🚨 FUNÇÃO AUXILIAR PARA ENVIAR NOTIFICAÇÃO
// =========================================================================

const sendApplicationNotification = async (job, user, profileData) => {
    const recipientUid = job.empresaUid;
    const senderName = profileData?.nome || user?.displayName || 'Candidato Desconhecido';

    if (!recipientUid || !user?.uid) {
        console.error("Falha ao enviar notificação: UID do destinatário ou do remetente ausente.");
        return;
    }

    try {
        await addDoc(collection(db, "notifications"), {
            recipientUid: recipientUid, // UID da empresa que postou a vaga
            title: "Nova Candidatura! 📥",
            message: `${senderName} se candidatou à sua vaga: "${job.title}".`,
            type: "application", 
            senderUid: user.uid, // UID do candidato
            jobTitle: job.title,
            jobId: job.id,
            read: false,
            timestamp: serverTimestamp(), // Campo de ordenação usado no Notifications.js
        });
        console.log(`Notificação de candidatura para a vaga "${job.title}" enviada com sucesso.`);
    } catch (error) {
        console.error("Erro ao enviar notificação:", error);
    }
};


// =========================================================================
// 2. COMPONENTE PRINCIPAL JOBS
// =========================================================================

export default function Jobs() {
    const { user, profileData } = useAuthStore(); 
    const isEmpresa = profileData?.tipoUsuario === 'empresa';
    const isCandidato = profileData?.tipoUsuario === 'pcd' || profileData?.tipoUsuario === 'Usuário Individual'; 

    const [jobs, setJobs] = useState([]);
    
    // 🎯 CORREÇÃO PERSISTÊNCIA: Leitura do localStorage na inicialização do useState
    const [appliedJobs, setAppliedJobs] = useState(() => {
        try {
            const storedValue = localStorage.getItem("appliedJobs");
            // Se houver valor, parse; senão, array vazio.
            return storedValue ? JSON.parse(storedValue) : []; 
        } catch (error) {
            console.error("Erro ao ler appliedJobs do localStorage:", error);
            return [];
        }
    });
    
    // 🎯 CORREÇÃO PERSISTÊNCIA: Leitura do localStorage na inicialização do useState
    const [savedJobs, setSavedJobs] = useState(() => {
        try {
            const storedValue = localStorage.getItem("savedJobs");
            // Se houver valor, parse; senão, array vazio.
            return storedValue ? JSON.parse(storedValue) : [];
        } catch (error) {
            console.error("Erro ao ler savedJobs do localStorage:", error);
            return [];
        }
    });

    const [isModalOpen, setIsModalOpen] = useState(false); 
    const [selectedJob, setSelectedJob] = useState(null); 
    const [view, setView] = useState(isEmpresa ? "minhas" : "explorar"); 
    const [filterDeficiencia, setFilterDeficiencia] = useState("todas");
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    const isMobile = windowWidth < 768;

    // useEffect para buscar vagas do Firestore
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

    // 🎯 useEffect para SALVAR appliedJobs no localStorage sempre que mudar
    useEffect(() => {
        localStorage.setItem("appliedJobs", JSON.stringify(appliedJobs));
    }, [appliedJobs]);

    // 🎯 useEffect para SALVAR savedJobs no localStorage sempre que mudar
    useEffect(() => {
        localStorage.setItem("savedJobs", JSON.stringify(savedJobs));
    }, [savedJobs]);

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const handleDeleteJob = async (job) => {
        if (!isEmpresa || job.empresaUid !== user.uid) {
            alert("Você não tem permissão para excluir esta vaga.");
            return;
        }

        if (window.confirm(`Tem certeza que deseja excluir a vaga: "${job.title}"? Esta ação é irreversível.`)) {
            try {
                const jobRef = doc(db, "vagas", job.id);
                await deleteDoc(jobRef);
                setSelectedJob(null); 
                alert("Vaga excluída com sucesso!");
            } catch (error) {
                console.error("Erro ao excluir vaga:", error);
                alert("Ocorreu um erro ao tentar excluir a vaga.");
            }
        }
    };
    
    // 🚨 handleApply com Notificação Integrada
    const handleApply = async (job) => {
        if (!user || !isCandidato) {
            alert("Você precisa estar logado como Candidato (PCD ou Individual) para se candidatar!");
            return;
        }
        
        if (job.empresaUid === user.uid) {
             alert("Empresas não podem se candidatar às suas próprias vagas.");
             return;
        }

        const isAlreadyApplied = appliedJobs.some((j) => j.id === job.id);

        if (isAlreadyApplied) {
            // Cancelar Candidatura
            setAppliedJobs((prev) => prev.filter((j) => j.id !== job.id));
            alert(`Candidatura para "${job.title}" cancelada.`);
        } else {
            // Candidatar-se
            setAppliedJobs((prev) => [...prev, job]);
            // CHAMA A FUNÇÃO DE NOTIFICAÇÃO
            await sendApplicationNotification(job, user, profileData); 
            
            alert(`Candidatura para "${job.title}" enviada com sucesso!`);
        }
    };

    const handleSave = (job) => {
        if (!isCandidato) return; 
        if (savedJobs.some((j) => j.id === job.id)) {
            setSavedJobs((prev) => prev.filter((j) => j.id !== job.id));
        } else {
            setSavedJobs((prev) => [...prev, job]);
        }
    };

    const getFilteredJobs = () => {
        const listToFilter = view === "explorar" || view === "minhas" ? jobs : view === "candidatadas" ? appliedJobs : savedJobs;
        
        let filteredList = listToFilter;

        if (isEmpresa && user && view === "explorar") {
             filteredList = listToFilter.filter(job => job.empresaUid !== user.uid);
        } else if (isEmpresa && user && view === "minhas") {
             filteredList = listToFilter.filter(job => job.empresaUid === user.uid);
        }

        if (filterDeficiencia === "todas" || isEmpresa) {
            return filteredList;
        } else {
            const filterValue = filterDeficiencia.toLowerCase();
            return filteredList.filter(job => 
                job.deficiencia === filterValue || 
                job.deficiencia === 'qualquer'
            );
        }
    }

    const displayedJobs = getFilteredJobs();

    const formatDeficiencia = (deficiencia) => {
        if (!deficiencia) return 'Não Especificado';
        if (deficiencia === 'qualquer') return 'Qualquer Pessoa / Público Geral';
        return deficiencia.charAt(0).toUpperCase() + deficiencia.slice(1);
    };


    // --- ESTILOS (Mantidos) ---

    const styles = useMemo(() => ({
        container: { 
            padding: isMobile ? "1rem" : "2rem", 
            maxWidth: "1200px", 
            margin: "0 auto", 
            backgroundColor: LIGHT_BACKGROUND, 
            minHeight: '100vh',
        },
        header: { 
            display: "flex", 
            flexDirection: isMobile ? "column" : "row", 
            justifyContent: "space-between", 
            alignItems: isMobile ? "stretch" : "center", 
            marginBottom: "1.5rem", 
            paddingBottom: "0.5rem",
        },
        navButtons: { 
            display: "flex", 
            flexWrap: "wrap", 
            gap: "0.5rem", 
            justifyContent: isMobile ? "center" : "flex-end" 
        },
        navButton: (active) => ({ 
            padding: isMobile ? "0.4rem 0.8rem" : "0.5rem 1rem",
            borderRadius: "9999px", 
            border: `2px solid ${PRIMARY_COLOR}`, 
            background: active ? PRIMARY_COLOR : 'transparent', 
            color: active ? CARD_BACKGROUND : PRIMARY_COLOR, 
            cursor: "pointer", 
            fontWeight: "700", 
            flex: isMobile ? "1" : "none", 
            textAlign: "center",
            fontSize: isMobile ? "0.8rem" : "1rem", 
            transition: 'all 0.3s',
        }),
        jobsGrid: { 
            display: "grid", 
            gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill, minmax(350px, 1fr))", 
            gap: "1.5rem", 
            marginTop: "1rem",
        },
        jobCard: (isApplied) => ({ 
            border: `1px solid ${isApplied ? SUCCESS_COLOR : BORDER_COLOR}`, 
            borderRadius: "1.5rem", 
            padding: isMobile ? "1rem" : "1.5rem", 
            background: isApplied ? SUCCESS_BACKGROUND : CARD_BACKGROUND, 
            boxShadow: SHADOW_LIGHT, 
            cursor: 'pointer',
            transition: 'transform 0.2s',
            position: 'relative',
        }),
        detailButton: {
            background: 'none',
            border: `1px solid ${PRIMARY_COLOR}`,
            color: PRIMARY_COLOR,
            borderRadius: "9999px",
            padding: '0.5rem 1rem',
            fontWeight: '600',
            cursor: 'pointer',
            marginTop: '1rem',
        },
        filterSelect: { 
            padding: "0.75rem", 
            borderRadius: "9999px", 
            border: `1px solid ${BORDER_COLOR}`, 
            marginBottom: "1.5rem", 
            width: isMobile ? "100%" : "300px", 
            textAlign: "left", 
            backgroundColor: CARD_BACKGROUND,
            color: FONT_COLOR_DARK, 
            fontWeight: '500',
        },
        detailText: {
            display: 'flex',
            alignItems: 'center',
            margin: '0.5rem 0',
            fontSize: isMobile ? '0.85rem' : '0.95rem',
            color: FONT_COLOR_DARK, 
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
        },
        iconStyle: {
            marginRight: "0.5rem",
            color: PRIMARY_COLOR,
            fontSize: '1.2rem',
        },

        // --- ESTILOS DOS MODAIS ---

        modalOverlay: { 
            position: "fixed", 
            top: 0, 
            left: 0, 
            width: "100vw", 
            height: "100vh", 
            backgroundColor: "rgba(26, 26, 26, 0.9)", 
            display: "flex", 
            justifyContent: "center", 
            alignItems: "center", 
            zIndex: 1000, 
            padding: "1rem",
            overflowY: 'auto', 
        },
        modalContent: { 
            backgroundColor: CARD_BACKGROUND, 
            padding: isMobile ? "1.2rem" : "2rem",
            borderRadius: "1.5rem", 
            boxShadow: "0 10px 30px rgba(0,0,0,0.4)", 
            width: "100%", 
            maxWidth: "600px", 
            display: "flex", 
            flexDirection: "column", 
            gap: "1rem",
            position: 'relative',
            margin: '2rem 0',
            maxHeight: isMobile ? '90vh' : 'auto', 
            overflowY: 'auto', 
            boxSizing: 'border-box',
        },
        input: { 
            padding: "0.75rem", 
            border: `1px solid ${BORDER_COLOR}`, 
            borderRadius: "9999px", 
            color: FONT_COLOR_DARK,
            width: '100%', 
            boxSizing: 'border-box',
        },
        textarea: {
            padding: "0.75rem", 
            border: `1px solid ${BORDER_COLOR}`, 
            borderRadius: "1rem",
            color: FONT_COLOR_DARK,
            minHeight: '100px',
            resize: 'vertical',
            width: '100%',
            boxSizing: 'border-box',
        },
        twoColumn: {
            display: 'flex',
            gap: '0.75rem',
            flexDirection: isMobile ? 'column' : 'row',
        },
        buttonRow: { 
            display: "flex", 
            flexWrap: 'wrap', 
            flexDirection: isMobile ? "column" : "row", 
            gap: "0.75rem", 
            marginTop: '0.5rem' 
        },
        primaryBtn: (active) => ({ 
            flex: isMobile ? 'none' : 1, 
            width: isMobile ? '100%' : 'auto', 
            background: SUCCESS_COLOR, 
            color: CARD_BACKGROUND, 
            border: "none", 
            borderRadius: "9999px", 
            padding: "0.75rem 1rem", 
            cursor: "pointer", 
            fontWeight: "700", 
            transition: 'background-color 0.2s',
            whiteSpace: 'nowrap',
        }),
        secondaryBtn: (active) => ({ 
             flex: isMobile ? 'none' : 1,
             width: isMobile ? '100%' : 'auto',
             background: active ? PRIMARY_COLOR : BORDER_COLOR, 
             color: active ? CARD_BACKGROUND : FONT_COLOR_DARK, 
             border: 'none',
             borderRadius: "9999px", 
             padding: "0.75rem 1rem", 
             cursor: "pointer", 
             fontWeight: "700",
             transition: 'background-color 0.2s',
             whiteSpace: 'nowrap',
        }),
        deleteBtn: {
            flex: isMobile ? 'none' : 1, 
            width: isMobile ? '100%' : 'auto',
            background: CANCEL_COLOR, 
            color: CARD_BACKGROUND, 
            border: "none", 
            borderRadius: "9999px", 
            padding: "0.75rem 1rem", 
            cursor: "pointer", 
            fontWeight: "700", 
            transition: 'background-color 0.2s',
            whiteSpace: 'nowrap',
        }
    }), [isMobile]);

    // =========================================================================
    // 3. COMPONENTE INTERNO: MODAL DE NOVA VAGA 
    // =========================================================================

    const NewJobModal = ({ onClose }) => {
        const [newJob, setNewJob] = useState({
            ...INITIAL_NEW_JOB_STATE,
            company: profileData?.nome || user?.displayName || '',
            empresaNome: profileData?.nome || user?.displayName || 'Empresa Desconhecida',
            deficiencia: TIPOS_DEFICIENCIA_MODAL[0].toLowerCase(), 
            ramo: RAMOS_ATUACAO[0],
            experience: EXPERIENCIA_OPCOES[0],
            modalidade: MODALIDADES[0],
            salary: "", 
        });
        
        const handleChange = (e) => {
            const { name, value } = e.target;
            setNewJob(prev => ({ ...prev, [name]: value }));
        };
        
        const isFieldValid = (value) => {
            if (value === null || value === undefined) return false;
            if (typeof value === 'string') {
                return value.trim().length > 0;
            }
            return !!value; 
        };

        const handleAddJob = async () => {
            const requiredFields = [
                'title', 'location', 'deficiencia', 'description', 
                'ramo', 'experience', 'modalidade'
            ];
            
            const isFormValid = requiredFields.every(field => isFieldValid(newJob[field]));

            if (!isFormValid) {
                alert("Por favor, preencha todos os campos obrigatórios.");
                return;
            }

            try {
                await addDoc(collection(db, "vagas"), {
                    ...newJob,
                    deficiencia: newJob.deficiencia.toLowerCase(),
                    empresaUid: user.uid,
                    postedAt: serverTimestamp(),
                });
                onClose();
            } catch (e) {
                console.error("Erro ao adicionar documento: ", e);
                alert("Erro ao publicar vaga. Tente novamente.");
            }
        };

        return (
            <div style={styles.modalOverlay}>
                <div style={styles.modalContent}>
                    <button onClick={onClose} style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', cursor: 'pointer', color: FONT_COLOR_DARK }}>
                        <FiX size={20} />
                    </button>
                    <h2 style={{ textAlign: "center", color: PRIMARY_COLOR, marginBottom: '1rem' }}><FiPlus style={{marginRight: '0.5rem'}}/> Publicar Nova Vaga</h2>
                    
                    <input style={styles.input} type="text" name="title" placeholder="Título da Vaga (Ex: Desenvolvedor Front-end)" value={newJob.title} onChange={handleChange} />
                    <input style={styles.input} type="text" name="company" placeholder="Nome da Empresa (Pré-preenchido)" value={newJob.company} onChange={handleChange} disabled />
                    
                    <div style={styles.twoColumn}>
                        <input style={styles.input} type="text" name="location" placeholder="Localização (Ex: SP/RJ)" value={newJob.location} onChange={handleChange} />
                        <input style={styles.input} type="text" name="salary" placeholder="Salário (Ex: R$ 3.500 - 5.000 ou A Combinar)" value={newJob.salary} onChange={handleChange} />
                    </div>

                    <textarea style={styles.textarea} name="description" placeholder="Descrição completa da vaga, responsabilidades e requisitos..." value={newJob.description} onChange={handleChange}></textarea>

                    <div style={styles.twoColumn}>
                        <select style={styles.input} name="ramo" value={newJob.ramo} onChange={handleChange}>
                            {RAMOS_ATUACAO.map(ramo => (<option key={ramo} value={ramo}>{ramo}</option>))}
                        </select>
                        <select style={styles.input} name="experience" value={newJob.experience} onChange={handleChange}>
                            {EXPERIENCIA_OPCOES.map(exp => (<option key={exp} value={exp}>{exp}</option>))}
                        </select>
                    </div>
                    
                    <div style={styles.twoColumn}>
                        <select style={styles.input} name="modalidade" value={newJob.modalidade} onChange={handleChange}>
                            {MODALIDADES.map(mod => (<option key={mod} value={mod}>{mod}</option>))}
                        </select>
                        <select style={styles.input} name="deficiencia" value={newJob.deficiencia} onChange={handleChange}>
                            {TIPOS_DEFICIENCIA_MODAL.map(tipo => (
                                <option key={tipo} value={tipo.toLowerCase()}>{tipo === 'Qualquer' ? 'Qualquer Pessoa/Público Geral' : tipo}</option>
                            ))}
                        </select>
                    </div>

                    <div style={styles.buttonRow}>
                        <button style={styles.primaryBtn(false)} onClick={handleAddJob}>Publicar Vaga</button>
                        <button style={styles.secondaryBtn(false)} onClick={onClose}>Cancelar</button>
                    </div>
                </div>
            </div>
        );
    };


    // =========================================================================
    // 4. COMPONENTE INTERNO: MODAL DE DETALHES DA VAGA
    // =========================================================================

    const JobDetailModal = ({ job, onClose }) => {
        const isApplied = appliedJobs.some((j) => j.id === job.id);
        const isSaved = savedJobs.some((j) => j.id === job.id);
        const postedAtDate = job.postedAt?.toDate ? job.postedAt.toDate() : new Date();

        const isJobOwner = isEmpresa && user && job.empresaUid === user.uid;

        return (
            <div style={styles.modalOverlay}>
                <div style={styles.modalContent}>
                    <button onClick={onClose} style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', cursor: 'pointer', color: FONT_COLOR_DARK }}>
                        <FiX size={20} />
                    </button>
                    
                    <h2 style={{ 
                        color: PRIMARY_COLOR, 
                        marginBottom: '0.5rem', 
                        borderBottom: `2px solid ${BORDER_COLOR}`, 
                        paddingBottom: '0.5rem',
                        fontSize: isMobile ? '1.2rem' : '1.5rem',
                    }}>
                        {job.title}
                        {isApplied && <span style={{fontSize: '0.8rem', marginLeft: '0.5rem', padding: '0.2rem 0.5rem', borderRadius: '4px', background: SUCCESS_COLOR, color: 'white'}}>Candidatado</span>}
                    </h2>
                    <h3 style={{ margin: '0 0 1rem 0', color: FONT_COLOR_DARK, fontSize: isMobile ? '1rem' : '1.2rem' }}>{job.company || job.empresaNome}</h3>
                    
                    <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '1rem', 
                        marginBottom: '1.5rem' 
                    }}>
                        <p style={styles.detailText}><FiMapPin style={styles.iconStyle} /> **Localização:** {job.location}</p>
                        <p style={styles.detailText}><FiGlobe style={styles.iconStyle} /> **Modalidade:** {job.modalidade || 'Não Informado'}</p>
                        <p style={styles.detailText}><FiLayers style={styles.iconStyle} /> **Ramo:** {job.ramo || 'Não Informado'}</p>
                        <p style={styles.detailText}><FiZap style={styles.iconStyle} /> **Experiência:** {job.experience || 'Não Informado'}</p>
                        <p style={styles.detailText}><FiDollarSign style={styles.iconStyle} /> **Salário:** {job.salary || 'A Negociar'}</p>
                        <p style={styles.detailText}><FiTarget style={styles.iconStyle} /> **Público Alvo:** {formatDeficiencia(job.deficiencia)}</p>
                        <p style={styles.detailText}><FiCalendar style={styles.iconStyle} /> **Publicada:** {postedAtDate.toLocaleDateString("pt-BR")}</p>
                    </div>
                    
                    <h4 style={{ color: PRIMARY_COLOR, borderTop: `1px solid ${BORDER_COLOR}`, paddingTop: '1rem', marginTop: '0' }}>Descrição da Vaga</h4>
                    <p style={{ whiteSpace: 'pre-wrap', color: FONT_COLOR_DARK, fontSize: '0.9rem', wordWrap: 'break-word' }}>{job.description || 'Nenhuma descrição fornecida.'}</p>

                    <div style={{...styles.buttonRow, marginTop: '2rem'}}>
                        {isCandidato && (
                            <>
                                <button onClick={() => handleApply(job)} style={styles.primaryBtn(isApplied)}>
                                    {isApplied ? <><FiX style={{ marginRight: "0.3rem" }} /> Candidatura Enviada (Cancelar)</> : <><FiFileText style={{ marginRight: "0.3rem" }}/> Candidatar-se</>}
                                </button>
                                <button onClick={() => handleSave(job)} style={styles.secondaryBtn(isSaved)}>
                                    <FiBookmark style={{ marginRight: "0.3rem" }} /> {isSaved ? "Remover dos Salvos" : "Salvar Vaga"}
                                </button>
                            </>
                        )}
                        
                        {isJobOwner && (
                            <>
                                <button onClick={() => handleDeleteJob(job)} style={styles.deleteBtn}>
                                    <FiTrash2 style={{ marginRight: "0.3rem" }} /> Excluir Vaga
                                </button>
                                <button onClick={onClose} style={styles.secondaryBtn(false)}>
                                    Fechar
                                </button>
                            </>
                        )}

                        {!isCandidato && !isJobOwner && (
                             <button onClick={onClose} style={styles.secondaryBtn(false)}>
                                Fechar
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    };


    // =========================================================================
    // 5. RENDERIZAÇÃO DO JOBS
    // =========================================================================

    return (
        <>
        <section style={styles.container}>
            <div style={styles.header}>
                <h1 style={{ fontSize: isMobile ? "1.8rem" : "2.5rem", color: PRIMARY_COLOR, textAlign: isMobile ? "center" : "left", marginBottom: '0.5rem' }}>
                    <FiBriefcase style={{ marginRight: '0.5rem' }}/> Oportunidades
                </h1>
                <div style={styles.navButtons}>
                    {/* Botão de Explorar / Minhas Vagas */}
                    <button style={styles.navButton(view === (isEmpresa ? "minhas" : "explorar") && !isEmpresa)} onClick={() => setView(isEmpresa ? "minhas" : "explorar")}>
                        {isEmpresa ? "Minhas Vagas" : "Explorar Vagas"}
                    </button>
                    {isEmpresa && (
                        <button style={styles.navButton(view === "explorar" && isEmpresa)} onClick={() => setView("explorar")}>
                            Vagas Gerais
                        </button>
                    )}
                    {isCandidato && <button style={styles.navButton(view === "candidatadas")} onClick={() => setView("candidatadas")}>Candidatadas</button>}
                    {isCandidato && <button style={styles.navButton(view === "salvas")} onClick={() => setView("salvas")}>Salvas</button>}
                    {isEmpresa && <button style={styles.navButton(isModalOpen)} onClick={() => setIsModalOpen(true)}><FiPlus /> Nova Vaga</button>}
                </div>
            </div>
            
            {/* SELETOR DE FILTRO */}
            {view === 'explorar' && !isEmpresa && (
                <select 
                    style={styles.filterSelect} 
                    onChange={(e) => setFilterDeficiencia(e.target.value)} 
                    value={filterDeficiencia}
                >
                    <option value="todas">Mostrar vagas para qualquer pessoa</option>
                    <optgroup label="Filtrar por Deficiência Específica">
                        {TIPOS_DEFICIENCIA_MODAL
                            .filter(t => t !== 'Qualquer')
                            .map(tipo => (
                            <option key={tipo} value={tipo.toLowerCase()}>{tipo}</option>
                        ))}
                    </optgroup>
                </select>
            )}

            <div style={styles.jobsGrid}>
                {displayedJobs.length === 0 ? (
                    <p style={{ textAlign: "center", color: FONT_COLOR_DARK, gridColumn: "1 / -1", padding: '2rem', backgroundColor: CARD_BACKGROUND, borderRadius: '1rem', boxShadow: SHADOW_LIGHT }}>Nenhuma vaga encontrada nesta visualização ou com os filtros.</p>
                ) : (
                    displayedJobs.map((job) => {
                        const isApplied = appliedJobs.some((j) => j.id === job.id);
                        const isSaved = savedJobs.some((j) => j.id === job.id);

                        return (
                            <div key={job.id} style={styles.jobCard(isApplied)} onClick={() => setSelectedJob(job)}>
                                <h3 style={{ margin: 0, color: PRIMARY_COLOR, fontSize: '1.25rem' }}>{job.title}</h3>
                                <p style={{ color: FONT_COLOR_DARK, margin: '0.25rem 0 1rem 0', fontWeight: 'bold' }}>{job.company || job.empresaNome}</p>
                                
                                <div style={styles.detailText}>
                                    <FiMapPin style={styles.iconStyle} /> {job.location} ({job.modalidade || 'Não Informado'})
                                </div>
                                <div style={styles.detailText}>
                                    <FiDollarSign style={styles.iconStyle} /> {job.salary || 'Salário: A Negociar'}
                                </div>
                                <div style={styles.detailText}>
                                    <FiTarget style={styles.iconStyle} /> Público Alvo: **{formatDeficiencia(job.deficiencia)}**
                                </div>
                                
                                <button style={styles.detailButton} onClick={(e) => { e.stopPropagation(); setSelectedJob(job); }}>
                                    <FiEdit3 style={{marginRight: '0.5rem'}}/> Ver Detalhes
                                </button>
                                
                                {isCandidato && (
                                    <div style={{...styles.buttonRow, marginTop: '0.5rem'}}>
                                        <button onClick={(e) => { e.stopPropagation(); handleApply(job); }} style={styles.primaryBtn(isApplied)}>
                                            {isApplied ? "Cancelar" : "Candidatar"}
                                        </button>
                                        <button onClick={(e) => { e.stopPropagation(); handleSave(job); }} style={styles.secondaryBtn(isSaved)}>
                                            <FiBookmark /> {isSaved ? "Remover" : "Salvar"}
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </section>

        {/* MODAL DE CRIAÇÃO DE VAGA */}
        {isEmpresa && isModalOpen && <NewJobModal onClose={() => setIsModalOpen(false)} />}

        {/* MODAL DE DETALHES DA VAGA */}
        {selectedJob && <JobDetailModal job={selectedJob} onClose={() => setSelectedJob(null)} />}
        </>
    );
}