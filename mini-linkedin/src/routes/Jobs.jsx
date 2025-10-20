    import React, { useState, useEffect, useMemo } from "react";
    import {
        FiPlus,
        FiBriefcase,
        FiMapPin,
        FiCalendar,
        FiBookmark,
        FiX, // Ícone de Cancelamento/Bloqueio
        FiGlobe,
        FiTarget,
        FiDollarSign,
        FiStar,
        FiCheckCircle, // Ícone de Candidatado
        FiClock, 
        FiPaperclip, 
        FiLayers 
    } from "react-icons/fi";
    // SIMULAÇÃO DE DEPENDÊNCIAS (Para o código ser executável)
    const db = {}; 
    const collection = (db, name) => ({ name }); 
    const addDoc = async (ref, data) => { console.log("Simulação: Adicionando documento:", data); return { id: `sim-doc-${Date.now()}` }; };
    const onSnapshot = () => () => {};
    const query = () => {};
    const orderBy = () => {};
    const serverTimestamp = () => ({ toDate: () => new Date() });
    const useAuthStore = () => ({ 
        user: { uid: "user-pcd-123" }, 
        profileData: { tipoUsuario: 'pcd' } 
    }); // Simulação: Usuário é um Candidato (PcD)

    // --- Variáveis de Estilização Profissional ---
    const PRIMARY_COLOR = "#3182CE"; // Azul Principal
    const ACCENT_COLOR = "#3182CE"; 
    const LIGHT_BACKGROUND = "#F7FAFC";
    const CARD_BACKGROUND = "#FFFFFF";
    const FONT_COLOR_DARK = "#1A1A1A";
    const BORDER_COLOR = "#E2E8F0";
    const SUCCESS_COLOR = "#48BB78"; // Verde para Candidatar-se

    // CORES NOVAS PARA CANCELAMENTO (Vermelho e Cancelado)
    const CANCEL_COLOR = "#E53E3E"; 
    const CANCEL_BACKGROUND = "#FED7D7"; 

    const EMPRESA_DESTAQUE = "TechSolutions Remoto";

    // --- CONFIGURAÇÕES DE DADOS E EMPRESAS ---
    const TIPOS_DEFICIENCIA = ['Visual', 'Auditiva', 'Fisica', 'Intelectual', 'Múltipla', 'Outra', 'Qualquer'];
    const TIPOS_DEFICIENCIA_LOW = TIPOS_DEFICIENCIA.map(d => d.toLowerCase());
    const MODALIDADES = [{ value: "todas", label: "Todas as Modalidades" }, { value: "presencial", label: "Presencial" }, { value: "hibrido", label: "Híbrido" }, { value: "home-office", label: "Home Office (Remoto)" }];
    const EXPERIENCIA_OPCOES = [{ value: "não exigida", label: "Não exigida (Primeiro Emprego)" }, { value: "básica", label: "Básica (0 a 1 ano)" }, { value: "intermediaria", label: "Intermediária (1 a 3 anos)" }, { value: "avançada", label: "Avançada (Mais de 3 anos)" }];
    const RAMOS_ATUACAO = [{ value: "todos", label: "Todos os Ramos" }, { value: "tecnologia", label: "Tecnologia e TI" }, { value: "financeiro", label: "Serviços Financeiros e Bancos" }, { value: "varejo", label: "Varejo e Comércio" }, { value: "industria", label: "Indústria e Manufatura" }, { value: "saude", label: "Saúde e Farmacêutica" }, { value: "advocacia", label: "Direito e Advocacia" }, { value: "logistica", label: "Logística e Transporte" }, { value: "marketing", label: "Marketing e Comunicação" }];

    // Vagas Inclusivas/Aprendiz
    const EMPRESAS_INCLUSIVAS = [
        { name: "Digital Bank", ramo: "financeiro", location: "São Paulo, SP", title: "Jovem Aprendiz - Compliance" },
        { name: "MegaTech Solutions", ramo: "tecnologia", location: "Belo Horizonte, MG", title: "Assistente de Suporte Júnior (PcD)" },
    ];

    // Vagas Gerais (CLT Efetivo, Não Aprendiz, Não PcD)
    const EMPRESAS_GERAIS = [
        { name: "Global Financial Group", ramo: "financeiro", location: "São Paulo, SP", title: "Analista de Risco Jr." },
        { name: "TecnoCorp Solutions", ramo: "tecnologia", location: "100% Home Office (Brasil)", title: "Desenvolvedor(a) Front-end Pleno" },
        { name: "Rede Varejista Brasil", ramo: "varejo", location: "Cidades por todo o Brasil", title: "Gerente de Loja" },
        { name: "Consultoria RH Excelência", ramo: "marketing", location: "Porto Alegre, RS", title: "Especialista em Recrutamento" },
    ];

    // --- GERAÇÃO DE DADOS ESTÁTICOS (ATUALIZADA E DETALHADA) ---
    const generateStaticJobs = () => {
        let staticJobs = [];
        let indexGlobal = 0;

        // 1. VAGAS PARA PcD / JOVEM APRENDIZ (COM DESCRIÇÃO DETALHADA)
        const PcdJobsCount = 20;
        for (let i = 0; i < PcdJobsCount; i++) {
            const company = EMPRESAS_INCLUSIVAS[i % EMPRESAS_INCLUSIVAS.length];
            const def = TIPOS_DEFICIENCIA_LOW[i % TIPOS_DEFICIENCIA_LOW.length];
            const mod = MODALIDADES[(i % 3) + 1].value;
            const tipoContrato = i % 2 === 0 ? 'Jovem Aprendiz' : 'CLT - Efetivo (PcD)';
            const setor = company.ramo.charAt(0).toUpperCase() + company.ramo.slice(1);

            const baseDescription = `
    **[${company.name}]** valoriza a diversidade e está comprometida com a inclusão. Buscamos um talento para se juntar à nossa equipe em ${company.location} e atuar no setor de ${setor}.

    **Seu Papel:**
    * Apoiar as rotinas administrativas e operacionais do setor de ${setor}.
    * Organizar documentos, planilhas e arquivos digitais, garantindo a rastreabilidade da informação.
    * Auxiliar no atendimento telefônico e recepção de clientes/fornecedores, seguindo as políticas de acessibilidade da empresa.
    * Participar de treinamentos obrigatórios focados em conformidade (compliance) e segurança da informação.

    **Requisitos:**
    * Ensino Médio completo ou cursando o Superior em área correlata (preferencialmente).
    * Estar enquadrado(a) na Lei de Cotas (PcD), ou ser elegível ao programa Jovem Aprendiz.
    * Desejo de aprender e crescer em um ambiente corporativo.
    * Conhecimento básico/intermediário no Pacote Office (Word, Excel).

    **Benefícios:**
    * Plano de Saúde e Odontológico completo.
    * Vale Refeição/Alimentação (R$ 800/mês).
    * Auxílio Transporte (ou Ajuda de Custo para Home Office).
    * Programa de mentoria e desenvolvimento de carreira, com foco em efetivação.
            `.trim();

            staticJobs.push({
                id: `static-${indexGlobal++}`,
                title: company.title,
                company: company.name,
                location: company.location,
                deficiencia: def,
                modalidade: mod,
                tipoContrato: tipoContrato,
                periodo: tipoContrato.includes('Aprendiz') ? '6h/dia' : '8h/dia', 
                informacaoVaga: baseDescription,
                preco: tipoContrato.includes('Aprendiz') ? 'R$ 950,00 + Benefícios' : 'R$ 2.500,00',
                experiencia: 'não exigida',
                ramo: company.ramo, 
                postedAt: { toDate: () => new Date(Date.now() - Math.floor(Math.random() * 90) * 24 * 60 * 60 * 1000) },
                isStatic: true,
                isPcd: true
            });
        }

        // 2. VAGAS GERAIS (CLT EFETIVO) (COM DESCRIÇÃO DETALHADA)
        const GeneralJobsCount = 20;
        for (let i = 0; i < GeneralJobsCount; i++) {
            const company = EMPRESAS_GERAIS[i % EMPRESAS_GERAIS.length];
            const mod = MODALIDADES[(i % 3) + 1].value;
            const experiencia = EXPERIENCIA_OPCOES[(i % 3) + 1].value; 
            const salarioBase = (i % 2 === 0) ? 'R$ 5.500,00' : 'R$ 3.800,00';
            const areaFoco = company.ramo.charAt(0).toUpperCase() + company.ramo.slice(1);

            const generalDescription = `
    **A ${company.name}**, líder no setor de ${areaFoco}, está expandindo sua equipe. Buscamos um profissional ${experiencia.toUpperCase()} para atuar em projetos estratégicos com foco em resultados no nosso novo escritório de ${company.location}.

    **Responsabilidades Chave:**
    * Gerenciar e executar tarefas complexas na área de ${company.title.split(' ')[0]} (Ex: Análise, Desenvolvimento, Gestão).
    * Analisar grandes volumes de dados (Big Data) e gerar relatórios de performance detalhados para a Diretoria e stakeholders.
    * Coordenar a comunicação e o fluxo de trabalho com equipes multifuncionais (Vendas, Marketing e Operações).
    * Liderar ou participar ativamente no desenvolvimento e implementação de novas metodologias de trabalho (Ex: Agile, Scrum).

    **Qualificações Necessárias:**
    * Formação superior completa (Bacharelado) em área correlata. Pós-graduação será um diferencial.
    * Experiência mínima comprovada de **${experiencia === 'intermediaria' ? '1 a 3 anos' : 'mais de 3 anos'}** na função ou em cargos similares.
    * Domínio avançado de ferramentas específicas do mercado (Ex: Power BI, SQL, Figma, ERPs específicos).
    * Excelente comunicação interpessoal, perfil proativo e comprovada capacidade de autogerenciamento no modelo ${mod.toUpperCase()}.

    **Por que trabalhar conosco?**
    * Modelo de trabalho ${mod.toUpperCase()} com flexibilidade de horário.
    * Remuneração competitiva e bônus anual (PLR) baseado em metas de performance.
    * Ambiente de alto crescimento, investimento em capacitação e cultura de feedback contínuo.
    * Pacote de benefícios completo (Assistência Médica/Odontológica Premium, Previdência Privada, Gympass).
            `.trim();

            staticJobs.push({
                id: `static-${indexGlobal++}`,
                title: company.title,
                company: company.name,
                location: company.location,
                deficiencia: 'qualquer', 
                modalidade: mod,
                tipoContrato: 'CLT - Efetivo', 
                periodo: '8h/dia', 
                informacaoVaga: generalDescription,
                preco: salarioBase + ' + PLR e Benefícios',
                experiencia: experiencia,
                ramo: company.ramo, 
                postedAt: { toDate: () => new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000) },
                isStatic: true,
                isPcd: false
            });
        }

        return staticJobs;
    };
    const ALL_STATIC_JOBS = generateStaticJobs();


    // --- FUNÇÕES UTILITÁRIAS (Mantidas) ---
    const formatDeficiencia = (deficiencia) => deficiencia === 'qualquer' ? 'Público Geral' : deficiencia.charAt(0).toUpperCase() + deficiencia.slice(1) + (deficiencia === 'qualquer' ? '' : ' (Vaga PcD)');
    const formatModalidade = (modalidade) => { switch ((modalidade || 'presencial').toLowerCase()) { case 'home-office': return '100% Home Office'; case 'hibrido': return 'Híbrido'; case 'presencial': return 'Presencial'; default: return 'Presencial'; } };
    const formatExperiencia = (experiencia) => EXPERIENCIA_OPCOES.find(opt => opt.value === (experiencia || 'não exigida'))?.label || 'Não informado';
    const formatRamo = (ramo) => RAMOS_ATUACAO.find(r => r.value === ramo)?.label || 'Não informado';
    const formatTimeAgo = (date) => {
        if (!date) return 'Data Indisponível'; const now = new Date(); const seconds = Math.floor((now - date) / 1000);
        const MINUTE = 60; const HOUR = 3600; const DAY = 86400; const WEEK = 604800; const MONTH = 2592000; 
        if (seconds < MINUTE) { return `agora mesmo`; } else if (seconds < HOUR) { const minutes = Math.floor(seconds / MINUTE); return `Há ${minutes} minuto${minutes > 1 ? 's' : ''}`; } else if (seconds < DAY * 2) { return 'Nova'; } else if (seconds < WEEK) { const days = Math.floor(seconds / DAY); return `Há ${days} dias`; } else if (seconds < MONTH) { const weeks = Math.floor(seconds / WEEK); return `Há ${weeks} semana${weeks > 1 ? 's' : ''}`; } else { const months = Math.floor(seconds / MONTH); if (months > 12) { const years = Math.floor(months / 12); return `Há ${years} ano${years > 1 ? 's' : ''}`; } return `Há ${months} mês${months > 1 ? 'es' : ''}`; }
    };


    // --- COMPONENTE: MODAL DE DETALHES DA VAGA (REFINADO) ---
    const JobDetailModal = ({ job, onClose, isApplied, isSaved, handleApply, handleSave, isCandidato, styles }) => {
        if (!job) return null;

        const postedAtDate = job.postedAt?.toDate ? job.postedAt.toDate() : new Date();
        const handleButtonClick = (action) => (e) => { e.stopPropagation(); action(job); };

        // Lógica Refinada para o Botão de Candidatura/Cancelamento
        const getApplyButtonStyles = (isApplied, styles) => {
            const baseStyle = { ...styles.primaryBtn, flex: 2 };

            if (isApplied) {
                // ESTILO PARA CANCELAR/RETIRAR CANDIDATURA (VERMELHO E CANCELADO)
                return {
                    ...baseStyle,
                    background: CANCEL_BACKGROUND, // Fundo Vermelho Claro
                    color: CANCEL_COLOR, // Texto Vermelho Escuro
                    border: `2px solid ${CANCEL_COLOR}`,
                    onMouseOver: (e) => { e.currentTarget.style.background = CANCEL_COLOR; e.currentTarget.style.color = CARD_BACKGROUND; },
                    onMouseOut: (e) => { e.currentTarget.style.background = CANCEL_BACKGROUND; e.currentTarget.style.color = CANCEL_COLOR; },
                };
            } else {
                // ESTILO PARA CANDIDATAR-SE (VERDE)
                return {
                    ...baseStyle,
                    background: SUCCESS_COLOR, // Verde para Candidatar-se
                    color: CARD_BACKGROUND,
                    border: 'none',
                    onMouseOver: (e) => e.currentTarget.style.background = '#38A169',
                    onMouseOut: (e) => e.currentTarget.style.background = SUCCESS_COLOR,
                };
            }
        };
        
        // Lógica do Botão de Salvar (Mantida)
        const getSaveButtonStyles = (isSaved, styles) => {
            const baseStyle = { ...styles.secondaryBtn, flex: 1 };
            if (isSaved) {
                return {
                    ...baseStyle,
                    border: `2px solid ${SUCCESS_COLOR}`, color: SUCCESS_COLOR,
                    onMouseOver: (e) => { e.currentTarget.style.background = SUCCESS_COLOR; e.currentTarget.style.color = CARD_BACKGROUND; },
                    onMouseOut: (e) => { e.currentTarget.style.background = CARD_BACKGROUND; e.currentTarget.style.color = SUCCESS_COLOR; },
                };
            } else {
                return {
                    ...baseStyle,
                    border: `2px solid ${PRIMARY_COLOR}`, color: PRIMARY_COLOR,
                    onMouseOver: (e) => { e.currentTarget.style.background = PRIMARY_COLOR; e.currentTarget.style.color = CARD_BACKGROUND; },
                    onMouseOut: (e) => { e.currentTarget.style.background = CARD_BACKGROUND; e.currentTarget.style.color = PRIMARY_COLOR; },
                };
            }
        };

        const renderDetail = (Icon, label, value, bold = false) => (
            <div style={{ display: 'flex', alignItems: 'flex-start', margin: '0.75rem 0', paddingBottom: '0.2rem', borderBottom: `1px dashed ${BORDER_COLOR}` }}>
                <Icon style={{ ...styles.iconStyle, color: PRIMARY_COLOR, fontSize: '1.2rem', marginTop: '0.2rem', flexShrink: 0 }} />
                <p style={{ margin: 0, color: FONT_COLOR_DARK, fontSize: '1rem', lineHeight: '1.5' }}>
                    <strong style={{ fontWeight: bold ? '700' : '600' }}>{label}:</strong> {value}
                </p>
            </div>
        );

        // Renderiza a descrição detalhada com quebra de linha
        const renderDetailedDescription = (text) => (
            <p style={{ color: '#4A5568', whiteSpace: 'pre-wrap', lineHeight: '1.8', fontSize: '1rem' }}>
                {text.split('\n').map((line, index) => {
                    if (line.startsWith('**')) {
                        // Trata títulos/seções em negrito e pula linha
                        return <strong key={index} style={{ display: 'block', marginTop: '1rem', marginBottom: '0.5rem', color: PRIMARY_COLOR, fontSize: '1.1rem' }}>{line.replace(/\*\*/g, '')}</strong>;
                    }
                    if (line.trim().startsWith('*')) {
                        // Trata listas com bullet points
                        return <span key={index} style={{ display: 'list-item', marginLeft: '20px' }}>{line.trim().substring(1).trim()}</span>;
                    }
                    return <span key={index} style={{ display: 'block' }}>{line}</span>;
                })}
            </p>
        );


        return (
            <div style={{ ...styles.modalOverlay, alignItems: 'flex-start', paddingTop: '50px' }} onClick={onClose}>
                <div 
                    style={{ ...styles.modalContent, maxWidth: styles.isMobile ? '95%' : '700px', maxHeight: '90vh', overflowY: 'auto', padding: styles.isMobile ? '1.5rem' : '2.5rem', }} 
                    onClick={(e) => e.stopPropagation()}
                >
                    <button style={{ position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', cursor: 'pointer', padding: '5px', borderRadius: '50%', transition: 'background 0.3s', zIndex: 10 }} onClick={onClose}>
                        <FiX size={28} color={FONT_COLOR_DARK} />
                    </button>

                    <h2 style={{ color: PRIMARY_COLOR, fontSize: '2rem', marginBottom: '0.5rem', lineHeight: '1.2' }}>{job.title}</h2>
                    <h3 style={{ color: ACCENT_COLOR, fontSize: '1.3rem', fontWeight: '600', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FiBriefcase /> {job.company}</h3>

                    <div style={{ display: 'grid', gridTemplateColumns: styles.isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '1rem 2rem', marginBottom: '1.5rem' }}>
                        {renderDetail(FiLayers, "Ramo de Atuação", formatRamo(job.ramo), true)}
                        {renderDetail(FiMapPin, "Localização", job.location, true)}
                        {renderDetail(FiGlobe, "Modalidade", formatModalidade(job.modalidade), true)}
                        {renderDetail(FiDollarSign, "Bolsa/Salário", job.preco, true)}
                        {renderDetail(FiTarget, "Público Alvo", formatDeficiencia(job.deficiencia), true)}
                        {renderDetail(FiStar, "Experiência", formatExperiencia(job.experiencia), true)}
                        {renderDetail(FiPaperclip, "Contrato", job.tipoContrato, true)}
                        {renderDetail(FiClock, "Período", job.periodo, true)}
                        {renderDetail(FiCalendar, "Publicada", postedAtDate.toLocaleDateString("pt-BR"), true)}
                    </div>

                    <h4 style={{ color: FONT_COLOR_DARK, fontSize: '1.2rem', borderBottom: `2px solid ${ACCENT_COLOR}`, paddingBottom: '0.5rem', margin: '1rem 0 1rem 0' }}>Descrição da Vaga</h4>
                    
                    {/* Renderização da descrição detalhada */}
                    {renderDetailedDescription(job.informacaoVaga)}
                    
                    {/* Botões de Ação */}
                    <div style={{ ...styles.buttonRow, marginTop: '2.5rem', borderTop: `1px solid ${BORDER_COLOR}`, paddingTop: '1.5rem' }}>
                        {isCandidato && (
                            <button
                                onClick={handleButtonClick(handleApply)}
                                style={getApplyButtonStyles(isApplied, styles)} 
                            >
                                {isApplied 
                                    ? <><FiX style={{ marginRight: "0.5rem" }} /> **CANCELADO**</> // Vermelho ao cancelar
                                    : <><FiCheckCircle style={{ marginRight: "0.5rem" }} /> Candidatar-se Agora</> // Verde ao aplicar
                                }
                            </button>
                        )}

                        {isCandidato && (
                            <button
                                onClick={handleButtonClick(handleSave)}
                                style={getSaveButtonStyles(isSaved, styles)}
                            >
                                <FiBookmark style={{ marginRight: "0.5rem" }} /> {isSaved ? "Vaga Salva" : "Salvar Vaga"}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    // --- COMPONENTE PRINCIPAL (JOBS) ---
    export default function Jobs() {
        const [selectedJob, setSelectedJob] = useState(null); 
        const { user, profileData } = useAuthStore();
        const isEmpresa = profileData?.tipoUsuario === 'empresa';
        const isCandidato = profileData?.tipoUsuario === 'pcd' || profileData?.tipoUsuario === 'Usuário Individual';
        const [firebaseJobs, setFirebaseJobs] = useState([]);
        const [staticJobs, setStaticJobs] = useState([]);
        const [appliedJobs, setAppliedJobs] = useState([]);
        const [savedJobs, setSavedJobs] = useState([]);
        const [isModalOpen, setIsModalOpen] = useState(false); 
        const [view, setView] = useState("explorar"); 
        const [filterDeficiencia, setFilterDeficiencia] = useState("todas");
        const [filterModalidade, setFilterModalidade] = useState("todas");
        const [filterRamo, setFilterRamo] = useState("todos"); 
        const [newJob, setNewJob] = useState({ title: "", company: "", location: "", deficiencia: "qualquer", modalidade: "presencial", tipoContrato: "CLT - Efetivo", informacaoVaga: "", preco: "", experiencia: "intermediaria", ramo: "todos" });
        const [windowWidth, setWindowWidth] = useState(window.innerWidth);

        const isMobile = windowWidth < 768;

        // Efeitos e Handlers (Mantidos)
        useEffect(() => {
            if (profileData && (isCandidato || isEmpresa)) { setStaticJobs(ALL_STATIC_JOBS); } else { setStaticJobs([]); }
        }, [profileData, isCandidato, isEmpresa]); 

        useEffect(() => {
            setAppliedJobs(JSON.parse(localStorage.getItem("appliedJobs")) || []);
            setSavedJobs(JSON.parse(localStorage.getItem("savedJobs")) || []);
            const handleResize = () => setWindowWidth(window.innerWidth);
            window.addEventListener("resize", handleResize);
            return () => window.removeEventListener("resize", handleResize);
        }, []);

        useEffect(() => localStorage.setItem("appliedJobs", JSON.stringify(appliedJobs)), [appliedJobs]);
        useEffect(() => localStorage.setItem("savedJobs", JSON.stringify(savedJobs)), [savedJobs]);

        const handleOpenJobDetails = (job) => { setSelectedJob(job); };

        // FUNÇÃO CANDIDATAR (Lógica de Cancelamento em Vermelho)
        const handleApply = (job) => {
            if (!isCandidato) {
                console.log("Ação bloqueada: Você precisa estar logado como candidato.");
                return;
            }
            
            const isCurrentlyApplied = appliedJobs.some((j) => j.id === job.id);

            if (isCurrentlyApplied) {
                setAppliedJobs(appliedJobs.filter((j) => j.id !== job.id));
            } else {
                setAppliedJobs([...appliedJobs, job]);
            }
            
            if (selectedJob && selectedJob.id === job.id && isCurrentlyApplied && view === "candidatadas") {
                setTimeout(() => setSelectedJob(null), 50); 
            }
        };
        
        // FUNÇÃO SALVAR
        const handleSave = (job) => {
            if (!isCandidato) {
                console.log("Ação bloqueada: Você precisa estar logado como candidato.");
                return;
            }
            if (savedJobs.some((j) => j.id === job.id)) {
                setSavedJobs(savedJobs.filter((j) => j.id !== job.id));
            } else {
                setSavedJobs([...savedJobs, job]);
            }
        };

        // Lógica de Filtro Principal (Mantida)
        const getFilteredJobs = useMemo(() => {
            const allJobs = [...staticJobs, ...firebaseJobs];
            let listToFilter;
            if (view === "candidatadas") { listToFilter = appliedJobs; } 
            else if (view === "salvas") { listToFilter = savedJobs; } 
            else if (view === "techsolutions") { listToFilter = allJobs.filter(job => (job.company || '').includes(EMPRESA_DESTAQUE)); } 
            else { listToFilter = isEmpresa && user ? firebaseJobs.filter(job => job.empresaUid === user.uid) : allJobs; }
            
            let filteredList = listToFilter;

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

        // --- ESTILIZAÇÃO RESPONSIVA (Mantida) ---
        const styles = useMemo(() => ({
            container: { padding: isMobile ? "1rem" : "2rem", maxWidth: "1200px", margin: "0 auto", backgroundColor: LIGHT_BACKGROUND, minHeight: "100vh" },
            header: { display: "flex", flexDirection: isMobile ? "column" : "row", justifyContent: "space-between", alignItems: isMobile ? "stretch" : "center", marginBottom: "2rem", gap: "1rem", borderBottom: `2px solid ${ACCENT_COLOR}`, paddingBottom: "1rem" },
            navButtons: { display: "flex", flexWrap: "wrap", gap: "0.75rem", justifyContent: isMobile ? "center" : "flex-end" },
            navButton: (active) => ({ 
                padding: "0.6rem 1.2rem", borderRadius: "25px", border: `2px solid ${PRIMARY_COLOR}`, 
                background: active ? PRIMARY_COLOR : "transparent", color: active ? CARD_BACKGROUND : PRIMARY_COLOR, 
                cursor: "pointer", fontWeight: "700", transition: "all 0.3s ease",
                boxShadow: active ? "0 4px 10px rgba(49, 130, 206, 0.3)" : "none", flex: isMobile ? "1 1 auto" : "none", textAlign: "center", whiteSpace: 'nowrap'
            }),
            filtersRow: { display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: "1rem", marginBottom: "2rem", },
            filterSelect: { padding: "0.75rem", borderRadius: "8px", border: `1px solid ${ACCENT_COLOR}`, width: "100%", background: CARD_BACKGROUND, color: FONT_COLOR_DARK, fontWeight: '500', cursor: 'pointer', outline: 'none', transition: 'border-color 0.3s', appearance: 'none', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='%233182CE'%3E%3Cpath fill-rule='evenodd' d='M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z' clip-rule='evenodd' /%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center', backgroundSize: '1.5em 1.5em', },
            jobsGrid: { display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.5rem" },
            jobCard: { borderLeft: `5px solid ${PRIMARY_COLOR}`, borderRadius: "10px", padding: "1.5rem", background: CARD_BACKGROUND, boxShadow: "0 6px 20px rgba(0, 0, 0, 0.08)", transition: "all 0.3s ease", cursor: 'pointer', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative' },
            cardTitle: { margin: "0 0 0.5rem 0", color: ACCENT_COLOR, fontSize: "1.4rem", fontWeight: "700", lineHeight: '1.3', },
            cardCompany: { color: PRIMARY_COLOR, fontSize: "1.1rem", fontWeight: "600", marginBottom: "0.5rem", display: 'flex', alignItems: 'center', gap: '0.5rem' },
            cardDetail: { display: "flex", alignItems: "center", margin: "0.4rem 0", color: FONT_COLOR_DARK, fontSize: "0.95rem", fontWeight: "400", lineHeight: '1.4' },
            iconStyle: { marginRight: "0.7rem", color: PRIMARY_COLOR, fontSize: "1.1rem" },
            buttonRow: { display: "flex", flexDirection: isMobile ? "column" : "row", gap: "0.75rem", marginTop: "1.5rem", paddingTop: '1rem', borderTop: `1px solid ${BORDER_COLOR}`, },
            primaryBtn: { flex: 1, background: PRIMARY_COLOR, color: "white", border: "none", borderRadius: "30px", padding: "0.75rem 1.2rem", cursor: "pointer", fontWeight: "700", fontSize: '1rem', transition: "background 0.3s ease, transform 0.2s ease", },
            secondaryBtn: { flex: 1, background: CARD_BACKGROUND, color: PRIMARY_COLOR, border: `2px solid ${PRIMARY_COLOR}`, borderRadius: "30px", padding: "0.75rem 1.2rem", cursor: "pointer", fontWeight: "700", fontSize: '1rem', transition: "background 0.3s ease, color 0.3s ease, transform 0.2s ease", },
            newBadge: { position: 'absolute', top: '1rem', right: '1rem', backgroundColor: SUCCESS_COLOR, color: 'white', padding: '0.2rem 0.8rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold', letterSpacing: '0.5px', textTransform: 'uppercase', },
            modalOverlay: { position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", backgroundColor: "rgba(0, 0, 0, 0.6)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000, padding: "1rem", overflowY: 'auto' },
            modalContent: { backgroundColor: "#fff", padding: "2rem", borderRadius: "10px", boxShadow: "0 15px 40px rgba(0,0,0,0.3)", width: "100%", maxWidth: isMobile ? "95%" : "600px", display: "flex", flexDirection: "column", gap: "1rem", position: 'relative', margin: isMobile ? '2rem 0' : '0' },
            isMobile 
        }), [isMobile]);

        const renderCardDetail = (Icon, label, value) => (
            <p style={styles.cardDetail} title={value}>
                <Icon style={styles.iconStyle} />
                {label && <strong style={{ marginRight: '0.3rem' }}>{label}:</strong>} {value}
            </p>
        );

        // --- RENDERIZAÇÃO ---
        return (
            <>
            <section style={styles.container}>
                {/* Header e Filtros */}
                <div style={styles.header}>
                    <h1 style={{ fontSize: "2.5rem", color: ACCENT_COLOR, textAlign: isMobile ? "center" : "left", fontWeight: 800 }}>
                        Oportunidades de Emprego
                    </h1>
                    <div style={styles.navButtons}>
                        <button style={styles.navButton(view === "explorar")} onClick={() => setView("explorar")}>
                            {isEmpresa ? "Minhas Vagas" : "Explorar Vagas"}
                        </button>
                        {isCandidato && <button style={styles.navButton(view === "candidatadas")} onClick={() => setView("candidatadas")}>Candidaturas</button>}
                        {isCandidato && <button style={styles.navButton(view === "salvas")} onClick={() => setView("salvas")}>Salvas</button>}
                        {isCandidato && (
                            <button style={styles.navButton(view === "techsolutions")} onClick={() => setView("techsolutions")}>
                                Vagas na {EMPRESA_DESTAQUE}
                            </button>
                        )}
                        {isEmpresa && <button style={styles.navButton(false)} onClick={() => setIsModalOpen(true)}><FiPlus style={{ marginRight: '0.5rem' }} /> Criar uma Vaga</button>}
                    </div>
                </div>

                <div style={styles.filtersRow}>
                    {/* Filtros */}
                    <div style={{ position: 'relative' }}>
                        <FiLayers style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: ACCENT_COLOR, pointerEvents: 'none' }} />
                        <select style={{ ...styles.filterSelect, paddingLeft: '2.5rem' }} onChange={(e) => setFilterRamo(e.target.value)} value={filterRamo}>
                            {RAMOS_ATUACAO.map(r => (<option key={r.value} value={r.value}>{r.label}</option>))}
                        </select>
                    </div>
                    
                    <div style={{ position: 'relative' }}>
                        <FiTarget style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: ACCENT_COLOR, pointerEvents: 'none' }} />
                        <select style={{ ...styles.filterSelect, paddingLeft: '2.5rem' }} onChange={(e) => setFilterDeficiencia(e.target.value)} value={filterDeficiencia}>
                            <option value="todas">Todas as Vagas (Público Geral)</option>
                            <optgroup label="Filtrar por Deficiência Específica">
                                {TIPOS_DEFICIENCIA.filter(t => t !== 'Qualquer').map(tipo => (<option key={tipo} value={tipo.toLowerCase()}>{tipo}</option>))}
                            </optgroup>
                        </select>
                    </div>

                    <div style={{ position: 'relative' }}>
                        <FiGlobe style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: ACCENT_COLOR, pointerEvents: 'none' }} />
                        <select style={{ ...styles.filterSelect, paddingLeft: '2.5rem' }} onChange={(e) => setFilterModalidade(e.target.value)} value={filterModalidade}>
                            {MODALIDADES.map(m => (<option key={m.value} value={m.value}>{m.label}</option>))}
                        </select>
                    </div>
                    {/* Fim dos filtros */}
                </div>


                {/* Grid de Vagas */}
                <div style={styles.jobsGrid}>
                    {displayedJobs.length === 0 ? (
                        <p style={{ textAlign: "center", color: ACCENT_COLOR, gridColumn: "1 / -1", padding: "3rem", backgroundColor: CARD_BACKGROUND, borderRadius: "10px", boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)" }}>
                            Nenhuma vaga encontrada com os filtros selecionados ou na sua lista.
                        </p>
                    ) : (
                        displayedJobs.map((job) => {
                            const isApplied = appliedJobs.some((j) => j.id === job.id);
                            const isSaved = savedJobs.some((j) => j.id === job.id);
                            const postedAtDate = job.postedAt?.toDate ? job.postedAt.toDate() : new Date();
                            const timeAgoString = formatTimeAgo(postedAtDate);
                            const isNew = timeAgoString === 'Nova';

                            return (
                                <div 
                                    key={job.id} 
                                    style={styles.jobCard}
                                    onClick={() => handleOpenJobDetails(job)} 
                                    onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = "0 10px 25px rgba(0, 0, 0, 0.12)"; }}
                                    onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = "0 6px 20px rgba(0, 0, 0, 0.08)"; }}
                                >
                                    {isNew && <span style={styles.newBadge}>Nova</span>}
                                    
                                    <h3 style={styles.cardTitle}>{job.title}</h3>
                                    <p style={styles.cardCompany}><FiBriefcase style={{ color: PRIMARY_COLOR }} /> {job.company}</p>

                                    {renderCardDetail(FiLayers, "Ramo", formatRamo(job.ramo))}
                                    {renderCardDetail(FiPaperclip, "Contrato", job.tipoContrato)}

                                    <div style={{ borderTop: `1px solid ${BORDER_COLOR}`, paddingTop: '0.75rem', marginTop: '0.5rem' }}>
                                        {renderCardDetail(FiMapPin, "", job.location)}
                                        {renderCardDetail(FiTarget, "", formatDeficiencia(job.deficiencia))}
                                        {renderCardDetail(FiDollarSign, "", job.preco)}
                                    </div>
                                    
                                    <p style={{ ...styles.cardDetail, fontSize: '0.85rem', color: '#666', marginTop: '1rem' }}>
                                        <FiCalendar style={{ ...styles.iconStyle, fontSize: '1rem', color: '#666' }} /> Publicada {timeAgoString}
                                    </p>

                                    {/* Botões dentro do card (Lógica de Cancelamento) */}
                                    <div style={styles.buttonRow} onClick={(e) => e.stopPropagation()}> 
                                        {isCandidato && (
                                            <button
                                                onClick={() => handleApply(job)}
                                                style={{
                                                    ...styles.primaryBtn,
                                                    flex: 2,
                                                    background: isApplied ? CANCEL_BACKGROUND : SUCCESS_COLOR,
                                                    color: isApplied ? CANCEL_COLOR : CARD_BACKGROUND,
                                                    border: isApplied ? `2px solid ${CANCEL_COLOR}` : 'none',
                                                    
                                                    onMouseOver: (e) => { 
                                                        e.currentTarget.style.background = isApplied ? CANCEL_COLOR : '#38A169';
                                                        e.currentTarget.style.color = CARD_BACKGROUND;
                                                    },
                                                    onMouseOut: (e) => {
                                                        e.currentTarget.style.background = isApplied ? CANCEL_BACKGROUND : SUCCESS_COLOR;
                                                        e.currentTarget.style.color = isApplied ? CANCEL_COLOR : CARD_BACKGROUND;
                                                    }
                                                }}
                                            >
                                                {isApplied 
                                                    ? <><FiX style={{ marginRight: "0.5rem" }} /> **CANCELADO**</> 
                                                    : <><FiCheckCircle style={{ marginRight: "0.5rem" }} /> Candidatar-se</>
                                                }
                                            </button>
                                        )}
                                        {isCandidato && (
                                            <button
                                                onClick={() => handleSave(job)}
                                                style={{
                                                    ...styles.secondaryBtn,
                                                    flex: 1,
                                                    border: `2px solid ${isSaved ? SUCCESS_COLOR : PRIMARY_COLOR}`,
                                                    color: isSaved ? SUCCESS_COLOR : PRIMARY_COLOR,
                                                    onMouseOver: (e) => { e.currentTarget.style.background = isSaved ? SUCCESS_COLOR : PRIMARY_COLOR; e.currentTarget.style.color = CARD_BACKGROUND; },
                                                    onMouseOut: (e) => { e.currentTarget.style.background = CARD_BACKGROUND; e.currentTarget.style.color = isSaved ? SUCCESS_COLOR : PRIMARY_COLOR; },
                                                }}
                                            >
                                                <FiBookmark style={{ marginRight: "0.5rem" }} /> {isSaved ? "Salvo" : "Salvar"}
                                            </button>
                                        )}
                                        
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </section>
            
            {/* Modal de Detalhes da Vaga */}
            <JobDetailModal 
                job={selectedJob} 
                onClose={() => setSelectedJob(null)} 
                isApplied={selectedJob ? appliedJobs.some(j => j.id === selectedJob.id) : false}
                isSaved={selectedJob ? savedJobs.some(j => j.id === selectedJob.id) : false}
                handleApply={handleApply}
                handleSave={handleSave}
                isCandidato={isCandidato}
                styles={styles}
            />

            {/* Modal de Criação de Vaga (Simulação) */}
            {isModalOpen && (
                <div style={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
                    <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <h2 style={{ color: PRIMARY_COLOR, fontSize: '1.8rem', fontWeight: '800', borderBottom: `2px solid ${ACCENT_COLOR}`, paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>
                            Publicar Nova Vaga
                        </h2>
                        <p>Simulação: A vaga será criada com contrato CLT Efetivo e Experiência Intermediária por padrão.</p>
                        <button 
                            style={{ ...styles.primaryBtn, background: SUCCESS_COLOR, marginTop: '1rem' }} 
                            onClick={() => { 
                                addDoc(collection(db, "vagas"), { 
                                    ...newJob, 
                                    title: "Nova Vaga CLT", 
                                    company: "Minha Empresa", 
                                    tipoContrato: "CLT - Efetivo", 
                                    deficiencia: "qualquer",
                                    preco: "R$ 4.000,00",
                                    empresaUid: user.uid, 
                                    postedAt: serverTimestamp() 
                                });
                                setIsModalOpen(false); 
                            }}
                        >
                            <FiPlus style={{ marginRight: "0.5rem" }} /> Publicar Vaga
                        </button>
                    </div>
                </div>
            )}
            </>
        );
    }