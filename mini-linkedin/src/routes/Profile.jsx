import { useEffect, useState } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import useAuth from '../store/useAuth';

// Nova Paleta de Cores Profissional
const PRIMARY_BLUE = "#007bff"; // Azul vibrante para ações principais
const DARK_TEXT = "#343a40"; // Texto escuro para legibilidade
const LIGHT_GRAY_BG = "#f8f9fa"; // Fundo da tela muito claro
const CARD_BG = "#ffffff"; // Fundo dos cards branco puro
const BORDER_GRAY = "#dee2e6"; // Borda suave dos elementos
const ACCENT_GREEN = "#28a745"; // Verde para links ou sucesso
const ACCENT_YELLOW_LIGHT = "#ffc107"; // Amarelo suave para destaque ou warnings
const SHADOW_ELEVATION = "0 0.5rem 1rem rgba(0,0,0,0.08)"; // Sombra mais elegante
const LIGHT_HOVER = "#e9ecef"; // Cor de fundo para hover em elementos leves

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
    cpf: '', // para PCD e Individual
    cnpj: '',
    razaoSocial: '',
    curriculoURL: '',
  });

  const [carregando, setCarregando] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [imagemPerfil, setImagemPerfil] = useState(null);
  const [curriculoArquivo, setCurriculoArquivo] = useState(null);
  const [uploading, setUploading] = useState(false);

  const CLOUDINARY_CLOUD_NAME = 'del48up33';
  const CLOUDINARY_UPLOAD_PRESET = 'dkebra';
  const CLOUDINARY_FILE_UPLOAD_PRESET = 'dkebra';

  const isMeuPerfil = !perfilUsuarioExterno || perfilUsuarioExterno.uid === usuarioLogado?.uid;

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
          curriculoURL: '',
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

  const handleCurriculoFileChange = (e) => {
    if (e.target.files[0]) {
      setCurriculoArquivo(e.target.files[0]);
      console.log('Novo arquivo de currículo selecionado:', e.target.files[0].name);
    }
  };

  const uploadCurriculo = async () => {
    if (!curriculoArquivo) return perfil.curriculoURL;

    const formData = new FormData();
    formData.append('file', curriculoArquivo);
    formData.append('upload_preset', CLOUDINARY_FILE_UPLOAD_PRESET);

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

      setPerfil(prev => ({ ...prev, curriculoURL: novoCurriculoURL }));
      setImagemPerfil(null);
      setCurriculoArquivo(null);
      setIsEditing(false); // Sai do modo de edição após salvar
    } catch (error) {
      console.error('Erro ao salvar o perfil:', error);
      alert(`Ocorreu um erro ao salvar o perfil: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  // Estilos aprimorados (Mantendo a responsividade via windowWidth)
  const containerWidth = windowWidth > 768 ? '28rem' : '90%';
  
  const baseInputStyle = {
    padding: '0.8rem 1.2rem',
    borderRadius: '0.5rem', 
    border: `1px solid ${BORDER_GRAY}`,
    fontSize: '1rem',
    color: DARK_TEXT,
    backgroundColor: CARD_BG,
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    width: '100%', // Adicionado para responsividade
  };
  // Estilo para o select ser mais bonito no Firefox/outros
  const selectStyle = {
    ...baseInputStyle,
    appearance: 'none',
    WebkitAppearance: 'none',
    MozAppearance: 'none',
    backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 1rem center',
    backgroundSize: '1em',
  };

  const buttonPrimaryStyle = {
    ...baseInputStyle,
    backgroundColor: PRIMARY_BLUE,
    color: CARD_BG,
    fontWeight: 'bold',
    border: 'none',
    cursor: 'pointer',
    transition: 'background-color 0.2s, transform 0.1s',
    '&:hover': {
      backgroundColor: '#0056b3',
      transform: 'translateY(-1px)',
    },
    '&:disabled': {
      backgroundColor: BORDER_GRAY,
      cursor: 'not-allowed',
      transform: 'none',
    },
  };
  const buttonSecondaryStyle = {
    ...buttonPrimaryStyle,
    backgroundColor: BORDER_GRAY,
    color: DARK_TEXT,
    '&:hover': {
      backgroundColor: LIGHT_HOVER,
      transform: 'translateY(-1px)',
    },
  };
  const viewItemContainerStyle = {
    backgroundColor: LIGHT_GRAY_BG,
    padding: '1rem 1.2rem',
    borderRadius: '0.5rem',
    border: `1px solid ${BORDER_GRAY}`,
    color: DARK_TEXT,
    textAlign: 'left',
    fontSize: '0.95rem',
  };
  const linkAccentStyle = {
    ...buttonPrimaryStyle,
    backgroundColor: ACCENT_GREEN,
    color: CARD_BG,
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    '&:hover': {
      backgroundColor: '#218838',
    },
  };
  const avatarPlaceholderStyle = {
    width: '8rem',
    height: '8rem',
    borderRadius: '50%',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BORDER_GRAY, 
    border: `2px solid ${PRIMARY_BLUE}`, 
    boxShadow: SHADOW_ELEVATION,
  };
  const editIconStyle = {
    position: 'absolute',
    bottom: '0.2rem',
    right: '0.2rem',
    width: '2.5rem',
    height: '2.5rem',
    borderRadius: '50%',
    backgroundColor: ACCENT_YELLOW_LIGHT,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    border: `2px solid ${CARD_BG}`, 
    fontSize: '1.2rem',
    color: DARK_TEXT,
    boxShadow: SHADOW_ELEVATION,
    transition: 'background-color 0.2s',
    '&:hover': {
      backgroundColor: '#e0a800', 
    },
  };
  const radioLabelStyle = {
    display: 'flex',
    alignItems: 'center',
    color: DARK_TEXT,
    fontSize: '0.95rem',
    cursor: 'pointer',
    flex: '1 1 auto', // Adicionado para responsividade em telas menores
    minWidth: 'fit-content',
    whiteSpace: 'nowrap',
  };

  if (carregando)
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: LIGHT_GRAY_BG,
        fontFamily: 'Arial, sans-serif'
      }}>
        <p style={{
          color: DARK_TEXT,
          fontSize: '1.25rem',
          fontWeight: 'bold',
          animation: 'pulse 1.5s infinite ease-in-out',
          '@keyframes pulse': {
            '0%, 100%': { opacity: 1 },
            '50%': { opacity: 0.5 }
          }
        }}>Carregando perfil...</p>
      </div>
    );

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      paddingTop: '2rem',
      paddingBottom: '2rem',
      backgroundColor: LIGHT_GRAY_BG,
      fontFamily: 'Arial, sans-serif'
    }}>

      {/* TELA DE VISUALIZAÇÃO */}
      {!isEditing && (
        <div style={{
          width: containerWidth,
          backgroundColor: CARD_BG,
          borderRadius: '0.75rem',
          boxShadow: SHADOW_ELEVATION,
          padding: '2rem',
          marginTop: '2rem',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem'
        }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', textAlign: 'center', color: PRIMARY_BLUE, marginBottom: '0.5rem' }}>
            Perfil {
              perfil.tipoUsuario === 'empresa' ? 'da Empresa' :
                perfil.tipoUsuario === 'Usuário Individual' ? 'Individual' :
                  'Pessoal'
            }
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', marginBottom: '1rem' }}>
            <div style={avatarPlaceholderStyle}>
              {perfil.fotoURL && <img src={perfil.fotoURL} alt="Foto de Perfil" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
            </div>
            {isMeuPerfil && (
              <button onClick={() => setIsEditing(true)} style={editIconStyle}>
                ✏️
              </button>
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            <div style={viewItemContainerStyle}>
              <strong>{perfil.tipoUsuario === 'empresa' ? 'Nome da Empresa' : 'Nome'}:</strong> {perfil.nome}
            </div>
            <div style={viewItemContainerStyle}>
              <strong>Email:</strong> {perfil.email || 'Não informado'}
            </div>
            <div style={viewItemContainerStyle}>
              <strong>Telefone:</strong> {perfil.telefone || 'Não informado'}
            </div>

            {/* Dados do PCD */}
            {perfil.tipoUsuario === 'pcd' && (
              <>
                <div style={viewItemContainerStyle}>
                  <strong>CPF:</strong> {perfil.cpf || 'Não informado'}
                </div>
                <div style={viewItemContainerStyle}>
                  <strong>Data de Nascimento:</strong> {perfil.dataNascimento || 'Não informada'}
                </div>
                {perfil.deficiencia && (
                  <div style={viewItemContainerStyle}>
                    <strong>Deficiência Principal:</strong> {perfil.deficiencia.charAt(0).toUpperCase() + perfil.deficiencia.slice(1)}
                  </div>
                )}
                {perfil.tipoDeficiencia && (
                  <div style={viewItemContainerStyle}>
                    <strong>Tipo Específico:</strong> {perfil.tipoDeficiencia}
                  </div>
                )}
                {perfil.curriculoURL && (
                  <a
                    href={perfil.curriculoURL}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={linkAccentStyle}
                  >
                    📄 Visualizar Currículo
                  </a>
                )}
              </>
            )}

            {/* EMPRESA */}
            {perfil.tipoUsuario === 'empresa' && (
              <>
                <div style={viewItemContainerStyle}>
                  <strong>Razão Social:</strong> {perfil.razaoSocial || 'Não informada'}
                </div>
                <div style={viewItemContainerStyle}>
                  <strong>CNPJ:</strong> {perfil.cnpj || 'Não informado'}
                </div>
              </>
            )}

            {/* Individual com Currículo */}
            {perfil.tipoUsuario === 'Usuário Individual' && (
              <>
                <div style={viewItemContainerStyle}>
                  <strong>CPF:</strong> {perfil.cpf || 'Não informado'}
                </div>
                <div style={viewItemContainerStyle}>
                  <strong>Data de Nascimento:</strong> {perfil.dataNascimento || 'Não informada'}
                </div>
                {perfil.curriculoURL && (
                  <a
                    href={perfil.curriculoURL}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={linkAccentStyle}
                  >
                    📄 Visualizar Currículo
                  </a>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* TELA DE EDIÇÃO */}
      {isEditing && isMeuPerfil && (
        <div style={{
          width: containerWidth,
          backgroundColor: CARD_BG,
          borderRadius: '0.75rem',
          boxShadow: SHADOW_ELEVATION,
          padding: '2rem',
          marginTop: '2rem',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem'
        }}>
          <button onClick={() => setIsEditing(false)} style={{
            position: 'absolute',
            left: '1.5rem',
            top: '1.5rem',
            width: '2.5rem',
            height: '2.5rem',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: LIGHT_GRAY_BG,
            border: `1px solid ${BORDER_GRAY}`,
            cursor: 'pointer',
            color: DARK_TEXT,
            fontSize: '1.2rem',
            boxShadow: SHADOW_ELEVATION,
            transition: 'background-color 0.2s',
            '&:hover': {
              backgroundColor: LIGHT_HOVER,
            },
          }}>←</button>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', textAlign: 'center', color: PRIMARY_BLUE, marginBottom: '1rem' }}>Editar Perfil</h2>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', marginBottom: '1rem' }}>
            <div style={avatarPlaceholderStyle}>
              {perfil.fotoURL && <img src={perfil.fotoURL} alt="Foto de Perfil" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
            </div>
            <label htmlFor="file-input" style={editIconStyle}>
              <input id="file-input" type="file" onChange={handleImageChange} style={{ display: 'none' }} />✏️
            </label>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Opções de Tipo de Usuário (Responsivo: Flex-wrap) */}
            <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <label style={radioLabelStyle}>
                <input type="radio" name="tipoUsuario" value="pcd" checked={perfil.tipoUsuario === 'pcd'} onChange={handleChange} style={{ marginRight: '0.5rem' }} disabled={uploading} />
                Candidato PcD
              </label>
              <label style={radioLabelStyle}>
                <input type="radio" name="tipoUsuario" value="empresa" checked={perfil.tipoUsuario === 'empresa'} onChange={handleChange} style={{ marginRight: '0.5rem' }} disabled={uploading} />
                Empresa
              </label>
              <label style={radioLabelStyle}>
                <input type="radio" name="tipoUsuario" value="Usuário Individual" checked={perfil.tipoUsuario === 'Usuário Individual'} onChange={handleChange} style={{ marginRight: '0.5rem' }} disabled={uploading} />
                Individual
              </label>
            </div>

            <input
              type="text"
              name="nome"
              placeholder={perfil.tipoUsuario === 'empresa' ? 'Nome da Empresa' : 'Nome Completo'}
              value={perfil.nome}
              onChange={handleChange}
              style={baseInputStyle}
              disabled={uploading}
            />
            <input
              type="tel"
              name="telefone"
              placeholder="Telefone"
              value={perfil.telefone}
              onChange={handleChange}
              style={baseInputStyle}
              disabled={uploading || perfil.tipoUsuario === 'empresa'}
            />

            {/* PCD Fields */}
            {perfil.tipoUsuario === 'pcd' && (
              <>
                <input type="text" name="cpf" placeholder="CPF" value={perfil.cpf} onChange={handleChange} style={baseInputStyle} disabled={uploading} />
                <input type="date" name="dataNascimento" placeholder="Data de nascimento" value={perfil.dataNascimento} onChange={handleChange} style={baseInputStyle} disabled={uploading} />

                <select name="deficiencia" value={perfil.deficiencia} onChange={handleChange} style={selectStyle} disabled={uploading}>
                  <option value="">Selecione a Deficiência Principal</option>
                  {tiposDeficienciaDisplay.map((tipo) => <option key={tipo} value={tipo.toLowerCase()}>{tipo}</option>)}
                </select>

                <select
                  name="tipoDeficiencia"
                  value={perfil.tipoDeficiencia}
                  onChange={handleChange}
                  style={selectStyle}
                  disabled={uploading || !perfil.deficiencia}
                >
                  <option value="">Selecione a Deficiência Específica</option>
                  {(opcoesDeficiencia[perfil.deficiencia] || []).map((opc) =>
                    <option key={opc} value={opc}>{opc}</option>
                  )}
                </select>

                {/* Upload Curriculo Container (Responsivo: padding e gap ajustados) */}
                <div style={{
                  border: `1px solid ${BORDER_GRAY}`,
                  borderRadius: '0.5rem',
                  padding: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                  backgroundColor: LIGHT_GRAY_BG,
                }}>
                  <label style={{ fontWeight: 'bold', color: DARK_TEXT, fontSize: '0.95rem' }}>
                    Enviar Currículo (PDF, DOCX)
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleCurriculoFileChange}
                    disabled={uploading}
                    style={{ ...baseInputStyle, border: 'none', padding: '0.6rem 0.8rem', backgroundColor: CARD_BG }}
                  />
                  <small style={{ color: DARK_TEXT, textAlign: 'center', fontSize: '0.85rem' }}>
                    {perfil.curriculoURL ? 'Currículo atual anexado. Envie um novo para substituir.' : 'Nenhum currículo anexado.'}
                    {curriculoArquivo && ` | Novo arquivo: ${curriculoArquivo.name}`}
                  </small>
                </div>
              </>
            )}

            {/* Empresa Fields */}
            {perfil.tipoUsuario === 'empresa' && (
              <>
                <input type="text" name="razaoSocial" placeholder="Razão Social" value={perfil.razaoSocial} onChange={handleChange} style={baseInputStyle} disabled={uploading} />
                <input type="text" name="cnpj" placeholder="CNPJ" value={perfil.cnpj} onChange={handleChange} style={baseInputStyle} disabled={uploading} />
              </>
            )}

            {/* Individual Fields */}
            {perfil.tipoUsuario === 'Usuário Individual' && (
              <>
                <input type="text" name="cpf" placeholder="CPF" value={perfil.cpf} onChange={handleChange} style={baseInputStyle} disabled={uploading} />
                <input type="date" name="dataNascimento" placeholder="Data de nascimento" value={perfil.dataNascimento} onChange={handleChange} style={baseInputStyle} disabled={uploading} />

                {/* Upload Curriculo Container (Responsivo) */}
                <div style={{
                  border: `1px solid ${BORDER_GRAY}`,
                  borderRadius: '0.5rem',
                  padding: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                  backgroundColor: LIGHT_GRAY_BG,
                }}>
                  <label style={{ fontWeight: 'bold', color: DARK_TEXT, fontSize: '0.95rem' }}>
                    Enviar Currículo (PDF, DOCX)
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleCurriculoFileChange}
                    disabled={uploading}
                    style={{ ...baseInputStyle, border: 'none', padding: '0.6rem 0.8rem', backgroundColor: CARD_BG }}
                  />
                  <small style={{ color: DARK_TEXT, textAlign: 'center', fontSize: '0.85rem' }}>
                    {perfil.curriculoURL ? 'Currículo atual anexado. Envie um novo para substituir.' : 'Nenhum currículo anexado.'}
                    {curriculoArquivo && ` | Novo arquivo: ${curriculoArquivo.name}`}
                  </small>
                </div>

              </>
            )}

            <button type="button" onClick={handleSave} style={buttonPrimaryStyle} disabled={uploading}>
              {uploading ? 'Salvando...' : 'Salvar Alterações'}
            </button>
            <button type="button" onClick={() => setIsEditing(false)} style={buttonSecondaryStyle} disabled={uploading}>
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}