import { useEffect, useState } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import useAuth from '../store/useAuth';

// nss paleta
const FONT_COLOR_DARK = "#1A1A1A";      
const ACCENT_COLOR = "#CF0908";         
const PRIMARY = "#FFFFFF";              
const BACKGROUND_COLOR = "#1A1A1A";     
const BORDER_COLOR = "#D9D9D9"; 
const CARD_BACKGROUND = "#FFFFFF";
const LIGHT_BACKGROUND = "#ECECEC"; 
const YELLOW_ACCENT = "#E6E69D";
const SHADOW_LIGHT = "0 10px 15px -3px rgba(0,0,0,0.1),0 4px 6px -2px rgba(0,0,0,0.05)";


export default function Profile({ user: perfilUsuarioExterno = null }) {
  const { user: usuarioLogado, profileData, updateProfilePicture } = useAuth();
  const [perfil, setPerfil] = useState({
    nome: '',
    telefone: '',    
    email: '',
    dataNascimento: '',
    tipoDeficiencia: '',
    deficiencia: '',
    fotoURL: '',
    tipoUsuario: '',
    cpf: '', // pros pcd e individual
    cnpj: '',
    razaoSocial: '',
    // NOVO: URL do currículo
    curriculoURL: '', 
  });

  const [carregando, setCarregando] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [imagemPerfil, setImagemPerfil] = useState(null);
  // NOVO: Estado para o arquivo de currículo
  const [curriculoArquivo, setCurriculoArquivo] = useState(null); 
  const [uploading, setUploading] = useState(false);

  const CLOUDINARY_CLOUD_NAME = 'del48up33';
  const CLOUDINARY_UPLOAD_PRESET = 'dkebra';
  // NOVO: Upload preset específico para arquivos, se for diferente (caso contrário, use o mesmo)
  const CLOUDINARY_FILE_UPLOAD_PRESET = 'dkebra'; 

  const isMeuPerfil = !perfilUsuarioExterno || perfilUsuarioExterno.uid === usuarioLogado?.uid;

  // lista dos tiposd de deficiencia
  const tiposDeficienciaDisplay = ['Visual', 'Auditiva', 'Física', 'Intelectual', 'Múltipla', 'Outra'];
  
 
  const opcoesDeficiencia = {
    'visual': ['baixa-visao', 'cegueira-total'],
    'auditiva': ['surdez-parcial', 'surdez-total'],
    'fisica': ['cadeirante', 'amputacao', 'mobilidade-reduzida'],
    'intelectual': ['autismo', 'sindrome-down', 'deficiencia-intelectual'],
    'multipla': ['visual-fisica', 'auditiva-fisica', 'outras-combinacoes'],
    'outra': ['nao-listada']
  };

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const loadProfile = async () => {
      setCarregando(true);
      const dadosCarregados = perfilUsuarioExterno ? perfilUsuarioExterno : profileData;

      if (dadosCarregados) {
        setPerfil({
          nome: dadosCarregados.nome || '',
          telefone: dadosCarregados.telefone || '',
          email: dadosCarregados.email || usuarioLogado?.email || '',
          dataNascimento: dadosCarregados.dataNascimento || '',
          tipoDeficiencia: dadosCarregados.tipoDeficiencia || '',
          deficiencia: dadosCarregados.deficiencia || '',
          fotoURL: dadosCarregados.fotoURL || '',
          tipoUsuario: dadosCarregados.tipoUsuario || 'pcd', 
          cpf: dadosCarregados.cpf || '',
          cnpj: dadosCarregados.cnpj || '',
          razaoSocial: dadosCarregados.razaoSocial || '',
          // NOVO: carrega URL do curriculo
          curriculoURL: dadosCarregados.curriculoURL || '',
        });
        
        if (isMeuPerfil && !dadosCarregados.nome) {
          setIsEditing(true); 
        } else {
          setIsEditing(false);
        }
      } else if (usuarioLogado) {
     
        setPerfil((prev) => ({
          ...prev,
          email: usuarioLogado.email,
          nome: usuarioLogado.displayName || '',
          fotoURL: usuarioLogado.photoURL || '',
          tipoUsuario: 'pcd', 
        }));
        setIsEditing(true);
      } else {
        setPerfil({
          nome: '', telefone: '', email: '', dataNascimento: '', tipoDeficiencia: '', 
          deficiencia: '', fotoURL: '', tipoUsuario: 'pcd', cpf: '', cnpj: '', razaoSocial: '',
          curriculoURL: '', // NOVO
        });
        setIsEditing(false);
      }
      setCarregando(false);
    };

    loadProfile();
  }, [usuarioLogado, profileData, perfilUsuarioExterno, isMeuPerfil]);


  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'deficiencia') {
        setPerfil((prev) => ({ ...prev, [name]: value, tipoDeficiencia: '' }));
    } else {
        setPerfil((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setImagemPerfil(e.target.files[0]);
      setPerfil((prev) => ({ ...prev, fotoURL: URL.createObjectURL(e.target.files[0]) }));
    }
  };

  // NOVO: Handler para o arquivo de currículo
  const handleCurriculoFileChange = (e) => {
    if (e.target.files[0]) {
      setCurriculoArquivo(e.target.files[0]);
      console.log('Novo arquivo de currículo selecionado:', e.target.files[0].name);
    }
  };
  
  // NOVO: Função para fazer o upload do currículo
  const uploadCurriculo = async () => {
    if (!curriculoArquivo) return perfil.curriculoURL;
    
    const formData = new FormData();
    formData.append('file', curriculoArquivo);
    formData.append('upload_preset', CLOUDINARY_FILE_UPLOAD_PRESET);

    // Especifica o tipo de recurso como 'raw' para arquivos que não são imagens (como PDF/DOCX)
    const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/raw/upload`,
        {
          method: 'POST',
          body: formData,
        }
    );

    if (!response.ok) throw new Error('Erro no upload do currículo para o Cloudinary');

    const data = await response.json();
    return data.secure_url;
  };

  const handleSave = async () => {
    if (!usuarioLogado || !isMeuPerfil) return;
    setUploading(true);

    try {
      let novaFotoURL = perfil.fotoURL;
      let novoCurriculoURL = perfil.curriculoURL; 

      // enviar imagem de Perfil
      if (imagemPerfil) {
        const formData = new FormData();
        formData.append('file', imagemPerfil);
        formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
          {
            method: 'POST',
            body: formData,
          }
        );

        if (!response.ok) throw new Error('Erro no upload da foto para o Cloudinary');

        const data = await response.json();
        novaFotoURL = data.secure_url;
        updateProfilePicture(novaFotoURL); 
      }

      
      if (curriculoArquivo) {
        novoCurriculoURL = await uploadCurriculo();
      }
      
   
      let dadosParaSalvar = {
        ...perfil,
        nome: perfil.nome || usuarioLogado.displayName || '',
        fotoURL: novaFotoURL,
        curriculoURL: novoCurriculoURL, 
        email: usuarioLogado.email,
        uid: usuarioLogado.uid,
      };

      //limpeza de dados
      if (dadosParaSalvar.tipoUsuario === 'pcd') {
        dadosParaSalvar = { 
          ...dadosParaSalvar, 
          cnpj: "", razaoSocial: "" 
        };
      } else if (dadosParaSalvar.tipoUsuario === 'empresa') {
        dadosParaSalvar = { 
          ...dadosParaSalvar, 
          cpf: "", dataNascimento: "", deficiencia: "", tipoDeficiencia: "", telefone: "", curriculoURL: "" 
        };
      } else if (dadosParaSalvar.tipoUsuario === 'Usuário Individual') {
        dadosParaSalvar = { 
          ...dadosParaSalvar, 
          cnpj: "", razaoSocial: "", deficiencia: "", tipoDeficiencia: "" 
        };
      }

      const docRef = doc(db, 'users', usuarioLogado.uid);
      await setDoc(docRef, dadosParaSalvar, { merge: true });

      setPerfil(prev => ({...prev, curriculoURL: novoCurriculoURL}));
      setImagemPerfil(null);
      setCurriculoArquivo(null);
    } catch (error) {
      console.error('Erro ao salvar o perfil:', error);
      alert(`Ocorreu um erro ao salvar o perfil: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  // estilos
  const containerWidth = windowWidth > 768 ? '28rem' : '90%';
  const inputStyle = { padding: '0.75rem', borderRadius: '9999px', border: `1px solid ${BORDER_COLOR}` };
  const buttonStyle = { padding: '0.75rem', borderRadius: '9999px', fontWeight: 'bold', backgroundColor: ACCENT_COLOR, color: PRIMARY, border: 'none', cursor: 'pointer', transition: 'background-color 0.2s' };
  const viewItemStyle = { padding: '0.75rem', borderRadius: '9999px', border: `1px solid ${BORDER_COLOR}`, backgroundColor: CARD_BACKGROUND, textAlign: 'center' };
  const linkButtonStyle = { ...buttonStyle, backgroundColor: YELLOW_ACCENT, color: FONT_COLOR_DARK, textDecoration: 'none', display: 'block', textAlign: 'center' };


  if (carregando)
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: LIGHT_BACKGROUND }}>
        <p style={{ color: FONT_COLOR_DARK, fontSize: '1.125rem', animation: 'pulse 2s infinite' }}>Carregando perfil...</p>
      </div>
    );

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '1rem', paddingBottom: '1rem', backgroundColor: LIGHT_BACKGROUND }}>
      
      {/* TELA DE VISUALIZAÇÃO */}
      {!isEditing && (
        <div style={{ width: containerWidth, backgroundColor: CARD_BACKGROUND, borderRadius: '1.5rem', boxShadow: SHADOW_LIGHT, padding: '1.5rem', marginTop: '4rem', position: 'relative' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', textAlign: 'center', marginBottom: '1.5rem', color: FONT_COLOR_DARK }}>
            Perfil {
              perfil.tipoUsuario === 'empresa' ? 'da Empresa' : 
              perfil.tipoUsuario === 'Usuário Individual' ? 'Individual' : 
              'Pessoal'
            }
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '1.5rem', position: 'relative' }}>
            <div style={{ width: '8rem', height: '8rem', borderRadius: '9999px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: YELLOW_ACCENT }}>
              {perfil.fotoURL && <img src={perfil.fotoURL} alt="Foto de Perfil" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
            </div>
            {isMeuPerfil && <button onClick={() => setIsEditing(true)} style={{ position: 'absolute', bottom: 0, right: '50%', transform: 'translateX(50%)', width: '2rem', height: '2rem', borderRadius: '9999px', cursor: 'pointer', backgroundColor: YELLOW_ACCENT, border: 'none', fontSize: '1rem' }}>✎</button>}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={viewItemStyle}>
              {perfil.tipoUsuario === 'empresa' ? `Nome da Empresa: ${perfil.nome}` : `Nome: ${perfil.nome}`}
            </div>
            <div style={viewItemStyle}>
              Email: {perfil.email || 'Não informado'}
            </div>
            <div style={viewItemStyle}>
                Telefone: {perfil.telefone || 'Não informado'}
            </div>

            {/* dados do pcd */}
            {perfil.tipoUsuario === 'pcd' && (
              <>
                <div style={viewItemStyle}>
                  CPF: {perfil.cpf || 'Não informado'}
                </div>
                <div style={viewItemStyle}>
                  Data de nascimento: {perfil.dataNascimento || 'Não informada'}
                </div>
                {perfil.deficiencia && (
                  <div style={viewItemStyle}>
                    Deficiência Principal: {perfil.deficiencia.charAt(0).toUpperCase() + perfil.deficiencia.slice(1)}
                  </div>
                )}
                {perfil.tipoDeficiencia && (
                  <div style={viewItemStyle}>
                    Tipo Específico: {perfil.tipoDeficiencia}
                  </div>
                )}

                {/* Visualizar Currículo para PCD */}
                {perfil.curriculoURL && (
                  <a 
                    href={perfil.curriculoURL} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    style={linkButtonStyle}
                  >
                    📄 Visualizar Currículo
                  </a>
                )}
              </>
            )}

            {/* EMPRESA */}
            {perfil.tipoUsuario === 'empresa' && (
              <>
                <div style={viewItemStyle}>
                  Razão Social: {perfil.razaoSocial || 'Não informada'}
                </div>
                <div style={viewItemStyle}>
                  CNPJ: {perfil.cnpj || 'Não informado'}
                </div>
              </>
            )}

            {/* individual com curriculo */}
            {perfil.tipoUsuario === 'Usuário Individual' && (
              <>
                <div style={viewItemStyle}>
                  CPF: {perfil.cpf || 'Não informado'}
                </div>
                <div style={viewItemStyle}>
                  Data de nascimento: {perfil.dataNascimento || 'Não informada'}
                </div>
                {/*  Visualizar Currriculo para Individual */}
                {perfil.curriculoURL && (
                  <a 
                    href={perfil.curriculoURL} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    style={linkButtonStyle}
                  >
                    Visualizar Currículo
                  </a>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* TELA DE EDIÇÃO */}
      {isEditing && isMeuPerfil && (
        <div style={{ width: containerWidth, backgroundColor: CARD_BACKGROUND, borderRadius: '1.5rem', boxShadow: SHADOW_LIGHT, padding: '1.5rem', marginTop: '4rem', position: 'relative' }}>
          <button onClick={() => setIsEditing(false)} style={{ position: 'absolute', left: '1rem', top: '1rem', width: '2.5rem', height: '2.5rem', borderRadius: '9999px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: BORDER_COLOR, border: 'none', cursor: 'pointer', color: FONT_COLOR_DARK, fontSize: '1rem' }}>←</button>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', textAlign: 'center', marginBottom: '1.5rem', color: FONT_COLOR_DARK }}>Editar perfil</h2>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '1.5rem', position: 'relative' }}>
            <div style={{ width: '8rem', height: '8rem', borderRadius: '9999px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: YELLOW_ACCENT, position: 'relative' }}>
              {perfil.fotoURL && <img src={perfil.fotoURL} alt="Foto de Perfil" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
              <label htmlFor="file-input" style={{ position: 'absolute', bottom: 0, right: '50%', transform: 'translateX(50%)', width: '2rem', height: '2rem', borderRadius: '9999px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', backgroundColor: YELLOW_ACCENT, fontSize: '1rem' }}>
                <input id="file-input" type="file" onChange={handleImageChange} style={{ display: 'none' }} />✎
              </label>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '1rem', flexWrap: 'wrap' }}>
              <label style={{ display: 'flex', alignItems: 'center', color: FONT_COLOR_DARK }}>
                <input type="radio" name="tipoUsuario" value="pcd" checked={perfil.tipoUsuario === 'pcd'} onChange={handleChange} style={{ marginRight: '0.5rem' }} disabled={uploading} />
                Candidato PCD
              </label>
              <label style={{ display: 'flex', alignItems: 'center', color: FONT_COLOR_DARK }}>
                <input type="radio" name="tipoUsuario" value="empresa" checked={perfil.tipoUsuario === 'empresa'} onChange={handleChange} style={{ marginRight: '0.5rem' }} disabled={uploading} />
                Empresa
              </label>
              <label style={{ display: 'flex', alignItems: 'center', color: FONT_COLOR_DARK }}>
                <input type="radio" name="tipoUsuario" value="Usuário Individual" checked={perfil.tipoUsuario === 'Usuário Individual'} onChange={handleChange} style={{ marginRight: '0.5rem' }} disabled={uploading} />
                Individual
              </label>
            </div>

            {/* Nome e Telefone */}
            <input 
              type="text" 
              name="nome" 
              placeholder={perfil.tipoUsuario === 'empresa' ? 'Nome da Empresa' : 'Nome Completo'} 
              value={perfil.nome} 
              onChange={handleChange} 
              style={inputStyle} 
              disabled={uploading} 
            />
            <input 
              type="tel" 
              name="telefone" 
              placeholder="Telefone" 
              value={perfil.telefone} 
              onChange={handleChange} 
              style={inputStyle} 
              disabled={uploading || perfil.tipoUsuario === 'empresa'} 
            />

            {/*PCD */}
            {perfil.tipoUsuario === 'pcd' && (
              <>
                <input type="text" name="cpf" placeholder="CPF" value={perfil.cpf} onChange={handleChange} style={inputStyle} disabled={uploading} />
                <input type="date" name="dataNascimento" placeholder="Data de nascimento" value={perfil.dataNascimento} onChange={handleChange} style={inputStyle} disabled={uploading} />
                
                {/* Deficiência Principal  */}
                <select name="deficiencia" value={perfil.deficiencia} onChange={handleChange} style={inputStyle} disabled={uploading}>
                  <option value="">Selecione a Deficiência Principal</option>
                  {tiposDeficienciaDisplay.map((tipo) => <option key={tipo} value={tipo.toLowerCase()}>{tipo}</option>)}
                </select>

                {/* Tipo Especifico*/}
                <select 
                  name="tipoDeficiencia" 
                  value={perfil.tipoDeficiencia} 
                  onChange={handleChange} 
                  style={inputStyle} 
                  disabled={uploading || !perfil.deficiencia}
                >
                  <option value="">Selecione a Deficiência Específica</option>
                  {(opcoesDeficiencia[perfil.deficiencia] || []).map((opc) => 
                    <option key={opc} value={opc}>{opc}</option>
                  )}
                </select>

                {/*enviar curriculo pra pcd*/}
                <div style={{ border: `1px solid ${BORDER_COLOR}`, borderRadius: '9999px', padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', backgroundColor: LIGHT_BACKGROUND }}>
                  <label style={{ fontWeight: 'bold', color: FONT_COLOR_DARK }}>
                    Enviar Currículo (PDF, DOCX)
                  </label>
                  <input 
                    type="file" 
                    accept=".pdf,.doc,.docx" 
                    onChange={handleCurriculoFileChange} 
                    disabled={uploading} 
                    style={{ padding: '0.5rem', border: 'none', backgroundColor: CARD_BACKGROUND, borderRadius: '9999px' }}
                  />
                  <small style={{ color: FONT_COLOR_DARK, textAlign: 'center' }}>
                    {perfil.curriculoURL ? 'Currículo atual anexado. Envie um novo para substituir.' : 'Nenhum currículo anexado.'}
                    {curriculoArquivo && ` | Novo arquivo: ${curriculoArquivo.name}`}
                  </small>
                </div>
              </>
            )}

            {/* empresa */}
            {perfil.tipoUsuario === 'empresa' && (
              <>
                <input type="text" name="razaoSocial" placeholder="Razão Social" value={perfil.razaoSocial} onChange={handleChange} style={inputStyle} disabled={uploading} />
                <input type="text" name="cnpj" placeholder="CNPJ" value={perfil.cnpj} onChange={handleChange} style={inputStyle} disabled={uploading} />
              </>
            )}

            {/* individual co curriculo */}
            {perfil.tipoUsuario === 'Usuário Individual' && (
              <>
                <input type="text" name="cpf" placeholder="CPF" value={perfil.cpf} onChange={handleChange} style={inputStyle} disabled={uploading} />
                <input type="date" name="dataNascimento" placeholder="Data de nascimento" value={perfil.dataNascimento} onChange={handleChange} style={inputStyle} disabled={uploading} />

                {/* NOVO: Campo de Upload de Currículo para Usuário Individual */}
                <div style={{ border: `1px solid ${BORDER_COLOR}`, borderRadius: '9999px', padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', backgroundColor: LIGHT_BACKGROUND }}>
                  <label style={{ fontWeight: 'bold', color: FONT_COLOR_DARK }}>
                    Enviar Currículo (PDF, DOCX)
                  </label>
                  <input 
                    type="file" 
                    accept=".pdf,.doc,.docx" 
                    onChange={handleCurriculoFileChange} 
                    disabled={uploading} 
                    style={{ padding: '0.5rem', border: 'none', backgroundColor: CARD_BACKGROUND, borderRadius: '9999px' }}
                  />
                  <small style={{ color: FONT_COLOR_DARK, textAlign: 'center' }}>
                    {perfil.curriculoURL ? 'Currículo atual anexado. Envie um novo para substituir.' : 'Nenhum currículo anexado.'}
                    {curriculoArquivo && ` | Novo arquivo: ${curriculoArquivo.name}`}
                  </small>
                </div>

              </>
            )}

            <button type="button" onClick={handleSave} style={buttonStyle} disabled={uploading}>
                {uploading ? 'Salvando...' : 'Concluir'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}