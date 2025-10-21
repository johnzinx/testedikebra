import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
    FiPlus, FiBriefcase, FiMapPin, FiCalendar, FiBookmark, FiX, 
    FiGlobe, FiTarget, FiDollarSign, FiStar, FiCheckCircle, 
    FiClock, FiPaperclip, FiLayers, FiZap, FiCode
} from "react-icons/fi";


// 1. CONSTANTES GLOBAIS DE TEMA E DADOS (CORREÇÃO DE ERROS DE REFERÊNCIA)


// Cores e Tema
const PRIMARY_COLOR = "#3182CE"; 
const ACCENT_COLOR = PRIMARY_COLOR; 
const LIGHT_BACKGROUND = "#F7FAFC"; 
const CARD_BACKGROUND = "#FFFFFF";
const FONT_COLOR_DARK = "#1A1A1A";
const FONT_COLOR_MEDIUM = "#4A5568";
const BORDER_COLOR = "#E2E8F0";
const SUCCESS_COLOR = "#48BB78"; // Verde para sucesso/candidatura
const CANCEL_COLOR = "#E53E3E"; // Vermelho para cancelamento
const CANCEL_BACKGROUND = "#FED7D7"; 
const EMPRESA_DESTAQUE = "TechSolutions Remoto"; // Empresa usada em filtro de destaque

// Opções de Filtro/Vaga
const RAMOS_ATUACAO = [
    { value: "todos", label: "Todos os Ramos" },
    { value: "ti", label: "Tecnologia da Informação" },
    { value: "saude", label: "Saúde e Bem-Estar" },
    { value: "financas", label: "Finanças e Contabilidade" },
    { value: "educacao", label: "Educação" },
    { value: "varejo", label: "Comércio e Varejo" },
];

const EXPERIENCIA_OPCOES = [
    { value: "não exigida", label: "Não Exigida" },
    { value: "junior", label: "Júnior" },
    { value: "pleno", label: "Pleno" },
    { value: "senior", label: "Sênior" },
];

const TIPOS_DEFICIENCIA = [
    { value: "todas", label: "Todas (Geral e PcD)" },
    { value: "qualquer", label: "Público Geral" },
    { value: "fisica", label: "Deficiência Física" },
    { value: "visual", label: "Deficiência Visual" },
    { value: "auditiva", label: "Deficiência Auditiva" },
    { value: "intelectual", label: "Deficiência Intelectual" },
];

const MODALIDADES = [
    { value: "todas", label: "Todas as Modalidades" },
    { value: "home-office", label: "Home Office" },
    { value: "hibrido", label: "Híbrido" },
    { value: "presencial", label: "Presencial" },
];

// Texto de Descrição DAS VAGAS
const baseDescription = `
**Descrição Detalhada do Cargo**
Esta vaga exige paixão por desenvolvimento e foco em soluções acessíveis. Buscamos um profissional que seja proativo e disposto a colaborar em um ambiente ágil.

**Responsabilidades Principais**
* Desenvolver e manter features focadas em acessibilidade (WCAG 2.1).
* Participar ativamente de ritos ágeis (Daily, Planning, Review e Retrospective).
* Garantir a qualidade do código através de testes unitários e de integração.
* Colaborar com designers e gerentes de produto para otimizar a experiência do usuário.

**Requisitos Obrigatórios**
* Experiência comprovada de 2 anos em React.js ou framework similar.
* Proficiência em JavaScript/TypeScript.
* Conhecimento sólido em metodologias ágeis (Scrum/Kanban).
* Para vagas PcD: Laudo atualizado.

**Diferenciais**
* Conhecimento em Jest/Testing Library.
* Experiência com Firebase/Firestore.
* Inglês intermediário.
`;

// 2. SIMULAÇÕES DE BACKEND (Para tornar o código independente de Firebase)


// Simulação de Vagas CRIADAS POR NÓS 
const generateStaticJobs = () => {
    const jobs = [];
    const titles = ["Desenvolvedor Front-End Pleno", "Analista de Dados Júnior", "Especialista em Suporte Técnico", "Gerente de Projetos - TI", "Web Designer Sênior"];
    const companies = ["TechSolutions Remoto", "Innovatech", "Digital Agency", "Global Corp", "Startup XPTO"];
    const locations = ["Remoto", "São Paulo, SP", "Rio de Janeiro, RJ", "Curitiba, PR", "Remoto (Nacional)"];

    for (let i = 1; i <= 10; i++) {
        const isTechSolutions = i % 3 === 0;
        const companyName = isTechSolutions ? EMPRESA_DESTAQUE : companies[i % companies.length];

        jobs.push({
            id: `static-job-${i}`,
            title: titles[i % titles.length] + (i % 2 === 0 ? ' (PcD)' : ''),
            company: companyName,
            location: locations[i % locations.length],
            modalidade: MODALIDADES[(i % 3) + 1].value, 
            preco: i % 2 === 0 ? "R$ 4.500 - R$ 7.000" : "A combinar",
            deficiencia: i % 2 === 0 ? TIPOS_DEFICIENCIA[(i % 4) + 1].value : 'qualquer', 
            ramo: RAMOS_ATUACAO[(i % 5) + 1].value,
            experiencia: EXPERIENCIA_OPCOES[i % 4].value,
            informacaoVaga: baseDescription.trim(),
            postedAt: { toDate: () => new Date(Date.now() - (i * 86400000 * (i < 3 ? 0.1 : 1))) }, // Data mock
            empresaUid: isTechSolutions ? 'empresa-destaque-123' : `empresa-uid-${i}`,
        });
    }
    return jobs;
};
const ALL_STATIC_JOBS = generateStaticJobs(); 

// Simulação do store de autenticação. Assume que o usuário é 'pcd' (candidato) por padrão.
const useAuthStore = () => ({ 
    // Simula um candidato
    user: { uid: "user-pcd-123" }, 
    profileData: { tipoUsuario: 'pcd' } 
    // Para simular uma empresa:
    // user: { uid: "empresa-123" }, 
    // profileData: { tipoUsuario: 'empresa' } 
}); 

// Simulação das funções de utilidade do Firebase (para evitar erros de importação não utilizada)
const db = {}; 
const collection = (db, name) => ({ name }); 
const addDoc = async (ref, data) => { console.log("Simulação: Adicionando documento:", data); return { id: `sim-doc-${Date.now()}` }; };
const onSnapshot = () => () => {};
const query = () => {};
const orderBy = () => {};
const serverTimestamp = () => ({ toDate: () => new Date() });

// Funções de formatação (mantidas do original)
const formatDeficiencia = (deficiencia) => TIPOS_DEFICIENCIA.find(opt => opt.value === deficiencia)?.label || 'Não Informada';
const formatModalidade = (modalidade) => MODALIDADES.find(opt => opt.value === modalidade)?.label || 'Presencial';
const formatExperiencia = (experiencia) => EXPERIENCIA_OPCOES.find(opt => opt.value === (experiencia || 'não exigida'))?.label || 'Não informado';
const formatRamo = (ramo) => RAMOS_ATUACAO.find(r => r.value === ramo)?.label || 'Não informado';

const formatTimeAgo = (date) => {
    if (!date || isNaN(date.getTime())) return 'Data Indisponível';
    const now = new Date(); const seconds = Math.floor((now - date) / 1000);
    const MINUTE = 60; const HOUR = 3600; const DAY = 86400; const WEEK = 604800; const MONTH = 2592000; 
    
    if (seconds < MINUTE) return `agora mesmo`;
    if (seconds < HOUR) { const minutes = Math.floor(seconds / MINUTE); return `Há ${minutes} minuto${minutes > 1 ? 's' : ''}`; }
    if (seconds < DAY * 2) return 'Nova';
    if (seconds < WEEK) { const days = Math.floor(seconds / DAY); return `Há ${days} dias`; }
    if (seconds < MONTH) { const weeks = Math.floor(seconds / WEEK); return `Há ${weeks} semana${weeks > 1 ? 's' : ''}`; }
    
    const months = Math.floor(seconds / MONTH);
    if (months > 12) { const years = Math.floor(months / 12); return `Há ${years} ano${years > 1 ? 's' : ''}`; }
    return `Há ${months} mês${months > 1 ? 'es' : ''}`;
};


// 4. COMPONENTE: JobDetailModal 

const JobDetailModal = ({ job, onClose, isApplied, isSaved, handleApply, handleSave, isCandidato, styles }) => {
    // A propriedade isMobile já está sendo injetada via styles
    const isMobile = styles.isMobile;

    if (!job) return null;

    // Define o estilo do botão de Candidatar/Cancelar
    const getApplyButtonStyles = (isApplied, styles) => {
        const baseStyle = { ...styles.primaryBtn, flex: 2 };
        if (isApplied) {
            return {
                ...baseStyle, background: CANCEL_BACKGROUND, color: CANCEL_COLOR, border: `2px solid ${CANCEL_COLOR}`,
                onMouseOver: (e) => { e.currentTarget.style.background = CANCEL_COLOR; e.currentTarget.style.color = CARD_BACKGROUND; },
                onMouseOut: (e) => { e.currentTarget.style.background = CANCEL_BACKGROUND; e.currentTarget.style.color = CANCEL_COLOR; },
            };
        } else {
            return {
                ...baseStyle, background: SUCCESS_COLOR, color: CARD_BACKGROUND, border: 'none',
                onMouseOver: (e) => e.currentTarget.style.background = '#38A169',
                onMouseOut: (e) => e.currentTarget.style.background = SUCCESS_COLOR,
            };
        }
    };
    
    // Define o estilo do botão de Salvar Vaga
    const getSaveButtonStyles = (isSaved, styles) => {
        const baseStyle = { ...styles.primaryBtn, flex: isMobile ? 0 : 1, width: isMobile ? '50px' : 'auto', padding: isMobile ? '0.75rem 0.5rem' : '0.75rem 1.5rem' };
        return {
            ...baseStyle,
            backgroundColor: isSaved ? ACCENT_COLOR : FONT_COLOR_MEDIUM,
            color: CARD_BACKGROUND,
            onMouseOver: (e) => e.currentTarget.style.backgroundColor = isSaved ? PRIMARY_COLOR : FONT_COLOR_DARK,
            onMouseOut: (e) => e.currentTarget.style.backgroundColor = isSaved ? ACCENT_COLOR : FONT_COLOR_MEDIUM,
        };
    };

    const handleButtonClick = (action) => (e) => { e.stopPropagation(); action(job); };

    // Renderiza uma linha de detalhe da vaga
    const renderDetail = (Icon, label, value, bold = false) => (
        <div style={{ display: 'flex', alignItems: 'flex-start', margin: '0.75rem 0', paddingBottom: '0.2rem', borderBottom: `1px dashed ${BORDER_COLOR}` }}>
            <Icon style={{ color: PRIMARY_COLOR, fontSize: isMobile ? '1rem' : '1.2rem', marginTop: '0.2rem', flexShrink: 0, marginRight: '0.5rem' }} />
            <p style={{ margin: 0, color: FONT_COLOR_DARK, fontSize: isMobile ? '0.9rem' : '1rem', lineHeight: '1.5' }}>
                <strong style={{ fontWeight: bold ? '700' : '600' }}>{label}:</strong> {value}
            </p>
        </div>
    );

    // Renderiza a descrição detalhada formatada
    const renderDetailedDescription = (text) => (
        <p style={{ color: FONT_COLOR_MEDIUM, whiteSpace: 'pre-wrap', lineHeight: '1.8', fontSize: isMobile ? '0.9rem' : '1rem' }}>
            {text.split('\n').map((line, index) => {
                if (line.startsWith('**')) {
                    return <strong key={index} style={{ display: 'block', marginTop: '1rem', marginBottom: '0.5rem', color: PRIMARY_COLOR, fontSize: isMobile ? '1rem' : '1.1rem' }}>{line.replace(/\*\*/g, '')}</strong>;
                }
                if (line.trim().startsWith('*')) {
                    return <span key={index} style={{ display: 'list-item', marginLeft: '20px' }}>{line.trim().substring(1).trim()}</span>;
                }
                return <span key={index} style={{ display: 'block' }}>{line}</span>;
            })}
        </p>
    );

    return (
        <div style={{ ...styles.modalOverlay, alignItems: isMobile ? 'flex-start' : 'center', paddingTop: isMobile ? '10px' : '50px' }} onClick={onClose}>
            <div style={{ ...styles.modalContent, width: isMobile ? "90%" : "700px", padding: isMobile ? "1rem" : "3rem", }} onClick={(e) => e.stopPropagation()}>
                <button onClick={onClose} style={styles.modalCloseButton}> <FiX size={isMobile ? 20 : 24} color={FONT_COLOR_DARK} /> </button>
                <h2 style={{ color: PRIMARY_COLOR, fontSize: isMobile ? '1.5rem' : '2rem', marginBottom: '0.5rem' }}>{job.title}</h2>
                <h3 style={{ color: FONT_COLOR_MEDIUM, fontSize: isMobile ? '1rem' : '1.2rem', marginBottom: '1.5rem' }}><FiBriefcase style={{ marginRight: '0.5rem' }}/> {job.company}</h3>

                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: isMobile ? '0.5rem 1rem' : '1rem 2rem' }}>
                    {renderDetail(FiLayers, "Ramo de Atuação", formatRamo(job.ramo), true)}
                    {renderDetail(FiMapPin, "Localização", job.location, true)}
                    {renderDetail(FiGlobe, "Modalidade", formatModalidade(job.modalidade), true)}
                    {renderDetail(FiDollarSign, "Salário/Benefícios", job.preco, true)}
                    {renderDetail(FiStar, "Nível de Exp.", formatExperiencia(job.experiencia), true)}
                    {renderDetail(FiTarget, "Deficiência", formatDeficiencia(job.deficiencia), true)}
                    {renderDetail(FiCalendar, "Publicado", formatTimeAgo(job.postedAt?.toDate ? job.postedAt.toDate() : new Date()), true)}
                </div>

                <h4 style={{ color: FONT_COLOR_DARK, marginTop: '2rem', borderBottom: `2px solid ${PRIMARY_COLOR}`, fontSize: isMobile ? '1.1rem' : '1.3rem' }}>Detalhes e Atribuições</h4>
                {renderDetailedDescription(job.informacaoVaga)}
                
                {/* Botões de Ação */}
                <div style={{ ...styles.buttonRow, flexDirection: isMobile ? 'column-reverse' : 'row', gap: isMobile ? '0.5rem' : '1rem' }}>
                    {isCandidato && (
                        <button onClick={handleButtonClick(handleApply)} style={{ ...getApplyButtonStyles(isApplied, styles), flex: 3, fontSize: isMobile ? '1rem' : '1.1rem' }}>
                            {isApplied ? <><FiX /> CANCELAR CANDIDATURA</> : <><FiCheckCircle /> CANDIDATAR-SE AGORA</>}
                        </button>
                    )}
                    {isCandidato && (
                        <button onClick={handleButtonClick(handleSave)} style={{ ...getSaveButtonStyles(isSaved, styles), padding: isMobile ? '0.75rem 1rem' : '0.75rem 1.5rem', flex: isMobile ? 1 : 1, fontSize: isMobile ? '1rem' : '1.1rem', whiteSpace: 'nowrap' }}>
                            <FiBookmark style={{ marginRight: isMobile ? 0 : '0.5rem' }}/> {isMobile ? "" : (isSaved ? "VAGA SALVA" : "SALVAR VAGA")}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

// 5. COMPONENTE PRINCIPAL: Jobs
export default function Jobs() {
    // ESTADOS
    const [selectedJob, setSelectedJob] = useState(null); 
    const { user, profileData } = useAuthStore(); 
    const isEmpresa = profileData?.tipoUsuario === 'empresa'; 
    const isCandidato = profileData?.tipoUsuario === 'pcd' || profileData?.tipoUsuario === 'Usuário Individual'; 
    const [firebaseJobs, setFirebaseJobs] = useState([]); // Vagas carregadas do "backend"
    const [staticJobs, setStaticJobs] = useState([]); // Vagas estáticas
    const [appliedJobs, setAppliedJobs] = useState([]); 
    const [savedJobs, setSavedJobs] = useState([]); 
    const [isModalOpen, setIsModalOpen] = useState(false); // Modal de criação de vaga (se for empresa)
    const [view, setView] = useState("explorar"); 
    const [filterDeficiencia, setFilterDeficiencia] = useState("todas");
    const [filterModalidade, setFilterModalidade] = useState("todas");
    const [filterRamo, setFilterRamo] = useState("todos"); 
    const [newJob, setNewJob] = useState({ /* ... valores iniciais ... */ });
    const [windowWidth, setWindowWidth] = useState(window.innerWidth); 
    const isMobile = windowWidth < 768; // Definição do ponto de corte para mobile

    // EFEITOS AO PASSAA O MOUSE 
    
    // Carrega vagas estáticas (agora com a constante ALL_STATIC_JOBS definida)
    useEffect(() => {
        if (profileData && (isCandidato || isEmpresa)) { setStaticJobs(ALL_STATIC_JOBS); } else { setStaticJobs([]); }
    }, [profileData, isCandidato, isEmpresa]); 

    // Carrega candidaturas/salvas do localStorage e configura resize
    useEffect(() => {
        setAppliedJobs(JSON.parse(localStorage.getItem("appliedJobs")) || []);
        setSavedJobs(JSON.parse(localStorage.getItem("savedJobs")) || []);
        
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize); 
    }, []);

    // Persiste candidaturas/salvas no localStorage
    useEffect(() => localStorage.setItem("appliedJobs", JSON.stringify(appliedJobs)), [appliedJobs]);
    useEffect(() => localStorage.setItem("savedJobs", JSON.stringify(savedJobs)), [savedJobs]);

    // HANDLERS E LÓGICA DE AÇÃO
    const handleOpenJobDetails = useCallback((job) => { setSelectedJob(job); }, []);

    const handleApply = useCallback((job) => {
        if (!isCandidato) return;
        const isCurrentlyApplied = appliedJobs.some((j) => j.id === job.id);
        
        if (isCurrentlyApplied) {
            setAppliedJobs(appliedJobs.filter((j) => j.id !== job.id));
        } else {
            setAppliedJobs([...appliedJobs, job]);
        }
        
        if (selectedJob && selectedJob.id === job.id && isCurrentlyApplied && view === "candidatadas") {
            // Pequeno delay para a transição do modal (melhor UX)
            setTimeout(() => setSelectedJob(null), 50); 
        }
    }, [appliedJobs, isCandidato, selectedJob, view]);
    
    const handleSave = useCallback((job) => {
        if (!isCandidato) return;
        if (savedJobs.some((j) => j.id === job.id)) {
            setSavedJobs(savedJobs.filter((j) => j.id !== job.id));
        } else {
            setSavedJobs([...savedJobs, job]);
        }
    }, [savedJobs, isCandidato]);


    // ESTILIZAÇÃO 
    // Passamos isMobile para dentro do useMemo para que o Jobs e o JobDetailModal reajam
    const styles = useMemo(() => ({
        isMobile, // Adicionando isMobile nos estilos para ser consumido pelo Modal
        // Estilos de Layout
        container: { padding: isMobile ? "1rem" : "2rem", minHeight: "100vh", backgroundColor: LIGHT_BACKGROUND },
        header: { display: "flex", flexDirection: isMobile ? "column" : "row", justifyContent: "space-between", alignItems: isMobile ? "flex-start" : "center", marginBottom: "1.5rem" },
        navButtons: { 
            display: "flex", 
            gap: "0.5rem", 
            marginTop: isMobile ? "1rem" : "0", 
            flexWrap: isMobile ? "wrap" : "nowrap" // Permite que os botões quebrem a linha no mobile
        },
        jobsGrid: { display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.5rem", marginTop: "1.5rem" },
        filtersRow: { 
            display: "flex", 
            flexWrap: "wrap", 
            gap: "1rem", 
            marginBottom: "1.5rem", 
            padding: "1rem", 
            backgroundColor: CARD_BACKGROUND, 
            borderRadius: "8px", 
            boxShadow: "0 2px 4px rgba(0,0,0,0.05)" 
        },
        
        // Elementos Interativos
        navButton: (isActive) => ({
            padding: isMobile ? "0.4rem 0.8rem" : "0.5rem 1rem", 
            border: `2px solid ${PRIMARY_COLOR}`, 
            borderRadius: "20px", 
            cursor: "pointer",
            fontSize: isMobile ? '0.8rem' : '1rem', // Fonte menor no mobile
            backgroundColor: isActive ? PRIMARY_COLOR : LIGHT_BACKGROUND, 
            color: isActive ? CARD_BACKGROUND : PRIMARY_COLOR,
            fontWeight: "600", 
            transition: "all 0.3s",
            whiteSpace: 'nowrap', // Impede que o texto quebre no botão
            ":hover": { backgroundColor: isActive ? PRIMARY_COLOR : BORDER_COLOR }
        }),
        filterSelect: { padding: "0.5rem 1rem", border: `1px solid ${BORDER_COLOR}`, borderRadius: "6px", backgroundColor: CARD_BACKGROUND, color: FONT_COLOR_DARK, minWidth: isMobile ? "100%" : "200px" },
        
        // Card de Vaga
        jobCard: {
            backgroundColor: CARD_BACKGROUND, padding: "1.25rem", borderRadius: "8px", boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
            cursor: "pointer", transition: "transform 0.2s, box-shadow 0.2s",
            borderLeft: `5px solid ${BORDER_COLOR}`, 
            position: 'relative', overflow: 'hidden',
            ":hover": { transform: "translateY(-3px)", boxShadow: "0 6px 10px rgba(0,0,0,0.15)" }
        },
        cardTitle: { fontSize: isMobile ? "1rem" : "1.2rem", color: FONT_COLOR_DARK, margin: "0 0 0.5rem 0" },
        cardCompany: { fontSize: "0.9rem", color: PRIMARY_COLOR, margin: "0 0 1rem 0", fontWeight: "600" },
        cardDetail: { display: "flex", alignItems: "center", fontSize: "0.85rem", color: FONT_COLOR_MEDIUM, margin: "0.2rem 0", overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
        iconStyle: { marginRight: "0.4rem", color: ACCENT_COLOR },
        newBadge: { position: 'absolute', top: '0', right: '0', backgroundColor: CANCEL_COLOR, color: CARD_BACKGROUND, padding: '0.2rem 0.5rem', borderBottomLeftRadius: '8px', fontSize: '0.75rem', fontWeight: '700' },

        // Modal
        modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.7)', display: 'flex', justifyContent: 'center', zIndex: 1000, overflowY: 'auto' },
        modalContent: {
            backgroundColor: CARD_BACKGROUND, 
            padding: isMobile ? "1.5rem" : "3rem", 
            borderRadius: "10px", 
            width: isMobile ? "95%" : "700px", 
            maxWidth: "90vw", 
            margin: isMobile ? '10px auto' : '20px auto', // Menor margem superior no mobile
            position: 'relative',
            boxShadow: '0 5px 15px rgba(0,0,0,0.3)'
        },
        modalCloseButton: { position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', cursor: 'pointer' },
        
        // Botões de Ação
        buttonRow: { display: "flex", gap: "1rem", marginTop: "1.5rem", justifyContent: 'flex-end', paddingTop: '1rem', borderTop: `1px solid ${BORDER_COLOR}` },
        primaryBtn: { padding: "0.75rem 1.5rem", borderRadius: "6px", fontWeight: "700", cursor: "pointer", transition: "background-color 0.3s", flex: 1, textAlign: 'center' }
        
    }), [isMobile]); 


    // LÓGICA DE FILTRAGEM
    const getFilteredJobs = useMemo(() => {
        const allJobs = [...staticJobs, ...firebaseJobs];
        let listToFilter;
        
        // 1. Define a lista base com base na aba (view)
        if (view === "candidatadas") { listToFilter = appliedJobs; } 
        else if (view === "salvas") { listToFilter = savedJobs; } 
        else if (view === "techsolutions") { listToFilter = allJobs.filter(job => (job.company || '').includes(EMPRESA_DESTAQUE)); } 
        else { 
            // 'explorar' (para candidato) ou 'minhas vagas' (para empresa)
            listToFilter = isEmpresa && user ? allJobs.filter(job => job.empresaUid === user.uid) : allJobs; 
        }
        
        let filteredList = listToFilter;

        // 2. Aplica filtros secundários (Deficiência, Modalidade, Ramo)
        if (filterDeficiencia !== "todas") {
            const filterValue = filterDeficiencia.toLowerCase();
            filteredList = filteredList.filter(job => 
                (job.deficiencia || 'qualquer').toLowerCase() === filterValue || 
                (job.deficiencia || 'qualquer') === 'qualquer'
            );
        }
        if (filterModalidade !== "todas") {
            filteredList = filteredList.filter(job => (job.modalidade || 'presencial').toLowerCase() === filterModalidade);
        }
        if (filterRamo !== "todos") {
            filteredList = filteredList.filter(job => (job.ramo || 'todos').toLowerCase() === filterRamo);
        }
        
        return filteredList;
    }, [staticJobs, firebaseJobs, view, appliedJobs, savedJobs, isEmpresa, user, filterDeficiencia, filterModalidade, filterRamo]);

    const displayedJobs = getFilteredJobs;

    // Renderiza um detalhe rápido do card de vaga
    const renderCardDetail = (Icon, label, value) => (
        <p style={styles.cardDetail} title={value}>
            <Icon style={styles.iconStyle} />
            {label && <strong style={{ marginRight: '0.3rem' }}>{label}:</strong>} {value}
        </p>
    );

    // RENDERIZAÇÃO PRINCIPAL
    return (
        <>
        <section style={styles.container}>
            {/* Header com Título e Botões de Navegação (View) */}
            <div style={styles.header}>
                <h1 style={{ fontSize: isMobile ? "1.5rem" : "2.5rem", color: ACCENT_COLOR }}>
                    <FiZap style={{ marginRight: '0.5rem' }}/> Oportunidades de Emprego
                </h1>
                <div style={styles.navButtons}>
                    <button style={styles.navButton(view === "explorar")} onClick={() => setView("explorar")}>
                        {isEmpresa ? "Minhas Vagas" : "Explorar Vagas"}
                    </button>
                    {isCandidato && <button style={styles.navButton(view === "candidatadas")} onClick={() => setView("candidatadas")}>Candidaturas</button>}
                    {isCandidato && <button style={styles.navButton(view === "salvas")} onClick={() => setView("salvas")}>Salvas</button>}
                    <button style={styles.navButton(view === "techsolutions")} onClick={() => setView("techsolutions")}>
                        <FiStar /> Destaque
                    </button>
                    {isEmpresa && <button style={styles.navButton(isModalOpen)} onClick={() => setIsModalOpen(true)}><FiPlus /> Nova Vaga</button>}
                </div>
            </div>

            {/* Linha de Filtros */}
            <div style={styles.filtersRow}>
                {/* Select de Ramo de Atuação */}
                <select style={styles.filterSelect} onChange={(e) => setFilterRamo(e.target.value)} value={filterRamo}>
                    {RAMOS_ATUACAO.map(r => (<option key={r.value} value={r.value}>{r.label}</option>))}
                </select>

                {/* Select de Modalidade */}
                <select style={styles.filterSelect} onChange={(e) => setFilterModalidade(e.target.value)} value={filterModalidade}>
                    {MODALIDADES.map(m => (<option key={m.value} value={m.value}>{m.label}</option>))}
                </select>

                {/* Select de Deficiência (Só aparece para Candidatos) */}
                {isCandidato && (
                    <select style={styles.filterSelect} onChange={(e) => setFilterDeficiencia(e.target.value)} value={filterDeficiencia}>
                        {TIPOS_DEFICIENCIA.map(d => (<option key={d.value} value={d.value}>{d.label}</option>))}
                    </select>
                )}
            </div>

            {/* Grid de Vagas */}
            <div style={styles.jobsGrid}>
                {displayedJobs.length > 0 ? (
                    displayedJobs.map((job) => {
                        const isApplied = appliedJobs.some(j => j.id === job.id);
                        const isSaved = savedJobs.some(j => j.id === job.id);
                        const postedAtDate = job.postedAt?.toDate ? job.postedAt.toDate() : new Date();
                        const timeAgo = formatTimeAgo(postedAtDate);
                        const isNew = timeAgo === 'Nova';

                        return (
                            <div key={job.id} style={{
                                ...styles.jobCard,
                                borderLeft: isApplied ? `5px solid ${SUCCESS_COLOR}` : (isSaved ? `5px solid ${ACCENT_COLOR}` : `5px solid ${BORDER_COLOR}`),
                            }} onClick={() => handleOpenJobDetails(job)}>
                                <div>
                                    {isNew && <span style={styles.newBadge}>Nova</span>}
                                    <h4 style={styles.cardTitle}>{job.title}</h4>
                                    <p style={styles.cardCompany}><FiBriefcase /> {job.company}</p>
                                    
                                    {renderCardDetail(FiMapPin, "", job.location)}
                                    {renderCardDetail(FiGlobe, "", formatModalidade(job.modalidade))}
                                    {renderCardDetail(FiDollarSign, "", job.preco)}
                                    {renderCardDetail(FiTarget, "", formatDeficiencia(job.deficiencia))}
                                    {renderCardDetail(FiCalendar, "Publicado", timeAgo)}
                                </div>
                                
                                <div style={{ ...styles.buttonRow, marginTop: '1rem', borderTop: 'none', justifyContent: 'space-between' }}>
                                    {isCandidato && (
                                         // Botão Candidatar/Cancelar (Maior)
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); handleApply(job); }} 
                                            style={{
                                                ...styles.primaryBtn, 
                                                flex: 2, 
                                                fontSize: isMobile ? '0.85rem' : '1rem',
                                                padding: isMobile ? '0.5rem 1rem' : '0.75rem 1.5rem',
                                                backgroundColor: isApplied ? CANCEL_BACKGROUND : SUCCESS_COLOR, 
                                                color: isApplied ? CANCEL_COLOR : CARD_BACKGROUND,
                                                border: isApplied ? `1px solid ${CANCEL_COLOR}` : 'none',
                                            }}
                                        >
                                            {isApplied ? <><FiX /> Cancelar</> : <><FiCheckCircle /> Candidatar</>}
                                        </button>
                                    )}
                                     {isCandidato && (
                                         // Botão Salvar (Menor, apenas ícone no mobile)
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); handleSave(job); }} 
                                            style={{
                                                ...styles.primaryBtn, 
                                                flex: isMobile ? 0 : 1, 
                                                width: isMobile ? '50px' : 'auto',
                                                fontSize: isMobile ? '0.85rem' : '1rem',
                                                padding: isMobile ? '0.5rem 0.5rem' : '0.75rem 1.5rem',
                                                backgroundColor: isSaved ? ACCENT_COLOR : FONT_COLOR_MEDIUM, 
                                                color: CARD_BACKGROUND,
                                                border: 'none',
                                            }}
                                        >
                                            <FiBookmark /> {isMobile ? "" : (isSaved ? "Salva" : "Salvar")}
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: FONT_COLOR_MEDIUM, fontSize: '1.2rem', padding: '3rem' }}> 
                        Nenhuma vaga encontrada com os filtros selecionados ou nesta aba.
                    </p>
                )}
            </div>
        </section>

        {/* Modal de Detalhes da Vaga */}
        {selectedJob && (
            <JobDetailModal 
                job={selectedJob} 
                onClose={() => setSelectedJob(null)} 
                isApplied={appliedJobs.some(j => j.id === selectedJob.id)}
                isSaved={savedJobs.some(j => j.id === selectedJob.id)}
                handleApply={handleApply}
                handleSave={handleSave}
                isCandidato={isCandidato}
                styles={styles} 
            />
        )}
        
        {/* Adicionar aqui o Modal de Criação de Vaga (se isEmpresa) */}
        {/* {isEmpresa && isModalOpen && <NewJobModal onClose={() => setIsModalOpen(false)} />} */}
        </>
    );
}