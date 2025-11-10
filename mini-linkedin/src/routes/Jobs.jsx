import React, { useState, useEffect, useMemo } from "react";
import {
  FiPlus, FiBriefcase, FiMapPin, FiCalendar, FiBookmark, FiX,
  FiTarget, FiDollarSign, FiGlobe, FiLayers, FiFileText,
  FiEdit3, FiTrash2, FiZap
} from "react-icons/fi";
import {
  collection, addDoc, onSnapshot, query, orderBy,
  serverTimestamp, doc, deleteDoc
} from "firebase/firestore";
import { db } from "../services/firebase";
import useAuthStore from "../store/useAuth";
import { Toaster, toast } from "react-hot-toast";

/* -------------------------
  Constantes e dados
------------------------- */
const COLORS = {
  primary: "#CF0908",
  dark: "#1A1A1A",
  card: "#FFFFFF",
  lightBg: "#ECECEC",
  border: "#D9D9D9",
  success: "#48BB78",
  cancel: "#E53E3E",
  successBg: "#E6FFFA"
};
const RAMOS = ["Tecnologia","Saúde","Finanças","Educação","Varejo","Serviços","Indústria","Outro"];
const EXPERIENCIA = ["Estágio","Júnior","Pleno","Sênior","Especialista"];
const MODALIDADES = ["Remoto","Presencial","Híbrido"];
const TIPOS_DEF = ["Visual","Auditiva","Fisica","Intelectual","Múltipla","Outra","Qualquer"];
const INITIAL_JOB = { title:"", company:"", location:"", deficiencia:"", description:"", salary:"", ramo:"", experience:"", modalidade:"", empresaNome:"", fotoPerfil:"" };

/* -------------------------
  Componente Jobs
------------------------- */
export default function Jobs(){
  const { user, profileData } = useAuthStore();
  const isEmpresa = profileData?.tipoUsuario === "empresa";
  const isCandidato = profileData?.tipoUsuario === "pcd" || profileData?.tipoUsuario === "Usuário Individual";

  const [jobs, setJobs] = useState([]);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [view, setView] = useState("explorar");
  const [filterDef, setFilterDef] = useState("todas");
  const [w, setW] = useState(window.innerWidth);
  const isMobile = w < 768;

  // snapshot vagas
  useEffect(()=>{
    const q = query(collection(db,"vagas"), orderBy("postedAt","desc"));
    const unsub = onSnapshot(q, s=>{
      setJobs(s.docs.map(d=>({ id:d.id, ...d.data() })));
    }, e=>console.error("Erro vagas:", e));
    return () => unsub();
  },[]);

  // carregar applied/saved por usuário
  useEffect(()=>{
    if (!user?.uid){ setAppliedJobs([]); setSavedJobs([]); return; }
    try {
      const aKey = `appliedJobs_${user.uid}`, sKey = `savedJobs_${user.uid}`;
      setAppliedJobs(JSON.parse(localStorage.getItem(aKey)) || []);
      setSavedJobs(JSON.parse(localStorage.getItem(sKey)) || []);
    } catch (e){ console.error("Erro localStorage:", e); setAppliedJobs([]); setSavedJobs([]); }
  },[user]);

  // persist applied
  useEffect(()=>{ if (!user?.uid) return; try{ localStorage.setItem(`appliedJobs_${user.uid}`, JSON.stringify(appliedJobs)); }catch(e){console.error(e);} },[appliedJobs,user]);
  // persist saved
  useEffect(()=>{ if (!user?.uid) return; try{ localStorage.setItem(`savedJobs_${user.uid}`, JSON.stringify(savedJobs)); }catch(e){console.error(e);} },[savedJobs,user]);

  useEffect(()=>{ const handleResize=()=>setW(window.innerWidth); window.addEventListener("resize",handleResize); return ()=>window.removeEventListener("resize",handleResize); },[]);

  const formatDef = d=>{
    if (!d) return "Não Especificado";
    if (d==="qualquer") return "Qualquer Pessoa / Público Geral";
    return d.charAt(0).toUpperCase()+d.slice(1);
  };

  const handleDeleteJob = async(job)=>{
    if(!isEmpresa || job.empresaUid !== user.uid){ toast.error("Você não tem permissão para excluir esta vaga."); return; }
    const ok = window.confirm(`Excluir vaga "${job.title}"? Esta ação é irreversível.`);
    if(!ok) return;
    try{ await deleteDoc(doc(db,"vagas",job.id)); setSelectedJob(null); toast.success("Vaga excluída."); }
    catch(e){ console.error(e); toast.error("Erro ao excluir vaga."); }
  };

  // candidatura: salva por usuário e envia notificação só para empresa dona da vaga
  const handleApply = async(job)=>{
    if(!user?.uid || !isCandidato){ toast.error("Faça login como candidato para se candidatar."); return; }
    if(job.empresaUid === user.uid){ toast.error("Empresas não podem se candidatar às próprias vagas."); return; }

    const already = appliedJobs.some(j=>j.id===job.id);
    if(already){
      setAppliedJobs(prev=> prev.filter(j=>j.id!==job.id));
      toast("Candidatura cancelada.");
      return;
    }
    const updated=[...appliedJobs, job];
    setAppliedJobs(updated);
    // enviar notificação
    try{
      if(job.empresaUid && job.empresaUid !== user.uid){
        await addDoc(collection(db,"notifications"), {
          recipientUid: job.empresaUid,
          senderUid: user.uid,
          senderName: profileData?.nome || user.displayName || "Candidato",
          jobId: job.id,
          jobTitle: job.title,
          type: "application",
          message: `${profileData?.nome || user.displayName || "Um candidato"} se candidatou: ${job.title}`,
          createdAt: serverTimestamp(),
          read: false
        });
      }
    }catch(e){ console.error("Erro notificação:", e); }
    toast.success("Candidatura enviada!");
  };

  const handleSave = (job)=>{
    if(!user?.uid || !isCandidato){ toast.error("Faça login para salvar vagas."); return; }
    const already = savedJobs.some(j=>j.id===job.id);
    const updated = already ? savedJobs.filter(j=>j.id!==job.id) : [...savedJobs, job];
    setSavedJobs(updated);
    toast(already ? "Removido dos salvos." : "Vaga salva.");
  };

  const getFilteredJobs = ()=>{
    let list = jobs;
    if(view==="candidatadas") list = appliedJobs;
    else if(view==="salvas") list = savedJobs;
    else if(isEmpresa && user) list = jobs.filter(j=>j.empresaUid===user.uid);
    if(filterDef==="todas" || isEmpresa) return list;
    const v = filterDef.toLowerCase();
    return list.filter(j=> j.deficiencia===v || j.deficiencia==="qualquer");
  };

  const displayed = getFilteredJobs();

  /* -------------------------
     Estilos compactos (mantive visual)
  ------------------------- */
  const styles = useMemo(()=>({
    container:{ padding:isMobile?"1rem":"2rem", maxWidth:1200, margin:"0 auto", background:COLORS.lightBg, minHeight:"100vh" },
    header:{ display:"flex", flexDirection:isMobile?"column":"row", justifyContent:"space-between", alignItems:isMobile?"stretch":"center", marginBottom:16 },
    navButtons:{ display:"flex", gap:8, flexWrap:"wrap", justifyContent:isMobile?"center":"flex-end" },
    navButton:(active)=>({ padding:isMobile?"6px 12px":"8px 16px", borderRadius:999, border:`2px solid ${COLORS.primary}`, background: active?COLORS.primary:"transparent", color: active?"#fff":COLORS.primary, fontWeight:700, cursor:"pointer" }),
    jobsGrid:{ display:"grid", gridTemplateColumns:isMobile?"1fr":"repeat(auto-fill,minmax(340px,1fr))", gap:16 },
    jobCard:(applied)=>({ border:`1px solid ${applied?COLORS.success:COLORS.border}`, borderRadius:16, padding:isMobile?12:16, background: applied?COLORS.successBg:COLORS.card, boxShadow:"0 6px 10px rgba(0,0,0,0.08)" }),
    detailButton:{ background:"none", border:`1px solid ${COLORS.primary}`, color:COLORS.primary, borderRadius:999, padding:"8px 12px", cursor:"pointer" },
    buttonRow:{ display:"flex", gap:8, marginTop:8, flexWrap:"wrap" },
    primaryBtn:(active)=>({ background:COLORS.success, color:"#fff", border:"none", padding:"8px 12px", borderRadius:999, cursor:"pointer" }),
    secondaryBtn:(active)=>({ background: active?COLORS.primary:COLORS.border, color: active?"#fff":COLORS.dark, border:"none", padding:"8px 12px", borderRadius:999, cursor:"pointer" })
  }),[isMobile]);

  /* -------------------------
     Modal de criar vaga (compacto)
  ------------------------- */
  const NewJobModal = ({onClose})=>{
    const [newJob, setNewJob] = useState({...INITIAL_JOB, company: profileData?.nome||user?.displayName||"", empresaNome: profileData?.nome||user?.displayName||"Empresa Desconhecida", deficiencia:TIPOS_DEF[0].toLowerCase(), ramo:RAMOS[0], experience:EXPERIENCIA[0], modalidade:MODALIDADES[0]} );
    const change = e=> setNewJob(p=>({...p,[e.target.name]: e.target.value}));
    const valid = v=> typeof v==="string"? v.trim().length>0 : !!v;
    const add = async ()=>{
      const required=['title','location','deficiencia','description','ramo','experience','modalidade'];
      if(!required.every(f=>valid(newJob[f]))){ toast.error("Preencha todos campos obrigatórios."); return; }
      try{ await addDoc(collection(db,"vagas"),{ ...newJob, deficiencia:newJob.deficiencia.toLowerCase(), empresaUid:user.uid, postedAt:serverTimestamp(), company:newJob.company, empresaNome:newJob.empresaNome, fotoPerfil:newJob.fotoPerfil }); onClose(); toast.success("Vaga publicada."); }
      catch(e){ console.error(e); toast.error("Erro ao publicar vaga."); }
    };
    return (
      <div style={{position:"fixed",top:0,left:0,width:"100vw",height:"100vh",background:"rgba(0,0,0,0.6)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:999}}>
        <div style={{background:COLORS.card,padding:16,borderRadius:12,maxWidth:600,width:"95%",boxSizing:"border-box"}}>
          <button onClick={onClose} style={{float:"right",background:"none",border:"none",cursor:"pointer"}}><FiX/></button>
          <h3 style={{color:COLORS.primary,textAlign:"center"}}><FiPlus/> Publicar Nova Vaga</h3>
          <input name="title" placeholder="Título" value={newJob.title} onChange={change} style={{width:"100%",padding:8,borderRadius:8,marginTop:8}}/>
          <input name="location" placeholder="Localização" value={newJob.location} onChange={change} style={{width:"100%",padding:8,borderRadius:8,marginTop:8}}/>
          <input name="salary" placeholder="Salário" value={newJob.salary} onChange={change} style={{width:"100%",padding:8,borderRadius:8,marginTop:8}}/>
          <textarea name="description" placeholder="Descrição" value={newJob.description} onChange={change} style={{width:"100%",padding:8,borderRadius:8,marginTop:8}}/>
          <div style={{display:"flex",gap:8,marginTop:8}}>
            <select name="ramo" value={newJob.ramo} onChange={change} style={{flex:1}}>{RAMOS.map(r=> <option key={r} value={r}>{r}</option>)}</select>
            <select name="experience" value={newJob.experience} onChange={change} style={{flex:1}}>{EXPERIENCIA.map(e=> <option key={e} value={e}>{e}</option>)}</select>
          </div>
          <div style={{display:"flex",gap:8,marginTop:8}}>
            <select name="modalidade" value={newJob.modalidade} onChange={change} style={{flex:1}}>{MODALIDADES.map(m=> <option key={m} value={m}>{m}</option>)}</select>
            <select name="deficiencia" value={newJob.deficiencia} onChange={change} style={{flex:1}}>{TIPOS_DEF.map(t=> <option key={t} value={t.toLowerCase()}>{t}</option>)}</select>
          </div>
          <div style={{display:"flex",gap:8,marginTop:12}}>
            <button onClick={add} style={{padding:"8px 12px",background:COLORS.success,color:"#fff",border:"none",borderRadius:999}}>Publicar</button>
            <button onClick={onClose} style={{padding:"8px 12px",border:"none",borderRadius:999}}>Cancelar</button>
          </div>
        </div>
      </div>
    );
  };

 /* -------------------------
    Job detail modal atualizado com foto
 ------------------------- */
 const JobDetailModal = ({job,onClose})=>{
    const isApplied = appliedJobs.some(j=>j.id===job.id);
    const isSaved = savedJobs.some(j=>j.id===job.id);
    const posted = job.postedAt?.toDate ? job.postedAt.toDate() : new Date();
    const isOwner = isEmpresa && user && job.empresaUid === user.uid;
    
    const modalContentStyle = {
      background: COLORS.card,
      padding: isMobile ? 20 : 30,
      borderRadius: 20,
      maxWidth: 720,
      width: "95%",
      maxHeight: "90vh",
      overflowY: "auto",
      boxShadow: "0 10px 20px rgba(0,0,0,0.2)",
      boxSizing: "border-box"
    };

    return (
      <div style={{position:"fixed",top:0,left:0,width:"100vw",height:"100vh",background:"rgba(0,0,0,0.6)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:999, padding: isMobile ? 10 : 0}}>
        <div style={modalContentStyle}>
          <button onClick={onClose} style={{float:"right",background:"none",border:"none", fontSize:24, color:COLORS.dark, cursor:"pointer"}}><FiX/></button>
          
          {/* Foto perfil */}
          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
            {job.fotoPerfil && <img src={job.fotoPerfil} alt="Perfil" style={{width:60,height:60,borderRadius:"50%",objectFit:"cover"}} />}
            <div>
              <h3 style={{color:COLORS.primary,fontSize:isMobile?22:28,margin:0}}>{job.title} {isApplied && <span style={{background:COLORS.success,color:"#fff",padding:"2px 6px",borderRadius:6,marginLeft:8, fontSize: isMobile ? 12 : 14}}>Candidatado</span>}</h3>
              <h4 style={{marginTop:4, color: COLORS.dark, fontSize: isMobile ? 16 : 18}}>{job.company || job.empresaNome}</h4>
            </div>
          </div>
          
          <div style={{display:"grid", gridTemplateColumns:isMobile?"1fr":"repeat(3,1fr)", gap: isMobile ? 10 : 15, marginTop:15, paddingBottom: 10, borderBottom: `1px solid ${COLORS.border}`}}>
            <div><FiMapPin/> <strong>Local:</strong> {job.location}</div>
            <div><FiGlobe/> <strong>Modalidade:</strong> {job.modalidade||"Não Informado"}</div>
            <div><FiZap/> <strong>Exp.:</strong> {job.experience||"Não Informado"}</div>
            <div><FiDollarSign/> <strong>Salário:</strong> {job.salary||"A Negociar"}</div>
            <div><FiTarget/> <strong>Público:</strong> {formatDef(job.deficiencia)}</div>
            <div><FiCalendar/> <strong>Publicada:</strong> {posted.toLocaleDateString("pt-BR")}</div>
          </div>
          
          <h4 style={{marginTop: isMobile ? 15 : 20, color:COLORS.primary, borderLeft:`4px solid ${COLORS.primary}`, paddingLeft: 8}}>Descrição</h4>
          <p style={{whiteSpace:"pre-wrap", lineHeight: 1.6}}>{job.description||"Nenhuma descrição fornecida."}</p>
          
          <div style={{display:"flex",gap:8,flexWrap:"wrap",marginTop: isMobile ? 15 : 20, paddingTop: isMobile ? 10 : 15, borderTop: `1px solid ${COLORS.border}`}}>
            {isCandidato && <>
              <button onClick={()=>handleApply(job)} style={{padding:"10px 16px",background:COLORS.success,color:"#fff",border:"none",borderRadius:999, fontWeight: 700, cursor: "pointer", transition: "all 0.3s"}}>{isApplied? "Cancelar Candidatura":"Candidatar-se"}</button>
              <button onClick={()=>handleSave(job)} style={{padding:"10px 16px",border:`1px solid ${COLORS.primary}`, background: isSaved ? COLORS.primary : "transparent", color: isSaved ? "#fff" : COLORS.primary, borderRadius:999, fontWeight: 700, cursor: "pointer", transition: "all 0.3s"}}>{isSaved? "Remover dos Salvos":"Salvar Vaga"}</button>
            </>}
            {isOwner && <>
              <button onClick={()=>handleDeleteJob(job)} style={{padding:"10px 16px",background:COLORS.cancel,color:"#fff",border:"none",borderRadius:999, fontWeight: 700, cursor: "pointer", transition: "all 0.3s"}}>Excluir Vaga</button>
              <button onClick={onClose} style={{padding:"10px 16px",background:COLORS.border, border:"none", borderRadius:999, fontWeight: 700, cursor: "pointer", transition: "all 0.3s"}}>Fechar</button>
            </>}
            {!isCandidato && !isOwner && <button onClick={onClose} style={{padding:"10px 16px",background:COLORS.border, border:"none", borderRadius:999, fontWeight: 700, cursor: "pointer", transition: "all 0.3s"}}>Fechar</button>}
          </div>
        </div>
      </div>
    );
 };

  /* -------------------------
     Render
  ------------------------- */
  return (
    <>
      <Toaster position="top-center" />
      <section style={styles.container}>
        <div style={styles.header}>
          <h1 style={{fontSize:isMobile?22:28,color:COLORS.primary}}><FiBriefcase/> Oportunidades</h1>
          <div style={styles.navButtons}>
            <button style={styles.navButton(view==="explorar" && !isEmpresa)} onClick={()=>setView("explorar")}>Explorar Vagas</button>
            {isEmpresa && <button style={styles.navButton(view==="minhas" && isEmpresa)} onClick={()=>setView("minhas")}>Minhas Vagas</button>}
            {isCandidato && <button style={styles.navButton(view==="candidatadas")} onClick={()=>setView("candidatadas")}>Candidatadas</button>}
            {isCandidato && <button style={styles.navButton(view==="salvas")} onClick={()=>setView("salvas")}>Salvas</button>}
            {isEmpresa && <button style={styles.navButton(isModalOpen)} onClick={()=>setIsModalOpen(true)}><FiPlus/> Nova Vaga</button>}
          </div>
        </div>

        {view==="explorar" && !isEmpresa && (
          <select style={{padding:10,borderRadius:999,border:`1px solid ${COLORS.border}`,marginBottom:12}} value={filterDef} onChange={(e)=>setFilterDef(e.target.value)}>
            <option value="todas">Mostrar vagas para qualquer pessoa</option>
            <optgroup label="Filtrar por Deficiência Específica">
              {TIPOS_DEF.filter(t=>t!=="Qualquer").map(t=> <option key={t} value={t.toLowerCase()}>{t}</option>)}
            </optgroup>
          </select>
        )}

        <div style={styles.jobsGrid}>
          {displayed.length===0
            ? <p style={{gridColumn:"1/-1",textAlign:"center",padding:24,background:COLORS.card,borderRadius:12,boxShadow:"0 6px 10px rgba(0,0,0,0.06)"}}>Nenhuma vaga encontrada.</p>
            : displayed.map(job=>{
              const isApplied = appliedJobs.some(j=>j.id===job.id);
              const isSaved = savedJobs.some(j=>j.id===job.id);
              return (
                <div key={job.id} style={styles.jobCard(isApplied)} onClick={()=>setSelectedJob(job)}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                    {job.fotoPerfil && <img src={job.fotoPerfil} alt="Perfil" style={{width:40,height:40,borderRadius:"50%",objectFit:"cover"}} />}
                    <div>
                      <h3 style={{margin:0,color:COLORS.primary}}>{job.title}</h3>
                      <p style={{margin:"2px 0 0 0",fontWeight:700}}>{job.company || job.empresaNome}</p>
                    </div>
                  </div>
                  <div style={{display:"flex",flexDirection:"column",gap:6}}>
                    <div><FiMapPin/> {job.location} ({job.modalidade||"Não Informado"})</div>
                    <div><FiDollarSign/> {job.salary || "A Negociar"}</div>
                    <div><FiTarget/> Público Alvo: <strong>{formatDef(job.deficiencia)}</strong></div>
                  </div>
                  <button style={styles.detailButton} onClick={(e)=>{ e.stopPropagation(); setSelectedJob(job); }}> <FiEdit3/> Ver Detalhes</button>

                  {isCandidato && <div style={{...styles.buttonRow}}>
                    <button onClick={(e)=>{e.stopPropagation(); handleApply(job);}} style={styles.primaryBtn(isApplied)}>{isApplied? "Cancelar":"Candidatar"}</button>
                    <button onClick={(e)=>{e.stopPropagation(); handleSave(job);}} style={styles.secondaryBtn(isSaved)}>{isSaved? "Remover":"Salvar"}</button>
                  </div>}
                </div>
              );
            })}
        </div>
      </section>

      {isEmpresa && isModalOpen && <NewJobModal onClose={()=>setIsModalOpen(false)} />}
      {selectedJob && <JobDetailModal job={selectedJob} onClose={()=>setSelectedJob(null)} />}
    </>
  );
}
