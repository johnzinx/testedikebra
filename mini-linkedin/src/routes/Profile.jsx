import { useEffect, useState } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import useAuth from '../store/useAuth';

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
    tipoUsuario: 'pcd',
    cpf: '',
    cnpj: '',
    razaoSocial: '',
  });

  const [carregando, setCarregando] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [imagemPerfil, setImagemPerfil] = useState(null);
  const [uploading, setUploading] = useState(false);

  const CLOUDINARY_CLOUD_NAME = 'del48up33';
  const CLOUDINARY_UPLOAD_PRESET = 'dkebra';

  const isMeuPerfil = !perfilUsuarioExterno || perfilUsuarioExterno.uid === usuarioLogado?.uid;

  const tiposDeficiencia = ['Auditiva', 'Visual', 'Fisica', 'Intelectual', 'Múltipla'];
  const opcoesDeficiencia = {
    Auditiva: ['Surdez total', 'Surdez parcial', 'Outro'],
    Visual: ['Cegueira total', 'Baixa visão', 'Outro'],
    Fisica: ['Mobilidade reduzida', 'Amputação', 'Outro'],
    Intelectual: ['Autismo', 'Síndrome de Down', 'Outro'],
    Múltipla: ['Combinação de deficiências', 'Outro']
  };

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    setCarregando(true);

    const loadProfile = async () => {
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
        });
        
        if (isMeuPerfil && !dadosCarregados.nome) {
          setIsEditing(true);
        } else {
          setIsEditing(false);
        }
      } else if (usuarioLogado) {
        setPerfil({
          ...perfil,
          email: usuarioLogado.email,
          nome: usuarioLogado.displayName || '',
          fotoURL: usuarioLogado.photoURL || '',
        });
        setIsEditing(true);
      } else {
        setPerfil({
          nome: '',
          telefone: '',
          email: '',
          dataNascimento: '',
          tipoDeficiencia: '',
          deficiencia: '',
          fotoURL: '',
          tipoUsuario: 'pcd',
          cpf: '',
          cnpj: '',
          razaoSocial: '',
        });
        setIsEditing(false);
      }
      setCarregando(false);
    };

    loadProfile();
  }, [usuarioLogado, profileData, perfilUsuarioExterno, isMeuPerfil]);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setPerfil((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setImagemPerfil(e.target.files[0]);
      setPerfil((prev) => ({ ...prev, fotoURL: URL.createObjectURL(e.target.files[0]) }));
    }
  };

  const handleSave = async () => {
    if (!usuarioLogado || !isMeuPerfil) return;
    setUploading(true);

    try {
      let novaFotoURL = perfil.fotoURL;

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

        if (!response.ok) throw new Error('Erro no upload para o Cloudinary');

        const data = await response.json();
        novaFotoURL = data.secure_url;
        updateProfilePicture(novaFotoURL);
      }
      
      const dadosParaSalvar = {
        ...perfil,
        nome: perfil.nome || usuarioLogado.displayName || '',
        fotoURL: novaFotoURL,
        email: usuarioLogado.email,
        uid: usuarioLogado.uid,
      };

      const docRef = doc(db, 'users', usuarioLogado.uid);

      await setDoc(docRef, dadosParaSalvar, { merge: true });

      setIsEditing(false);
      setImagemPerfil(null);
    } catch (error) {
      console.error('Erro ao salvar o perfil:', error);
      alert(`Ocorreu um erro ao salvar o perfil: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const containerWidth = windowWidth > 768 ? '28rem' : '90%';

  if (carregando)
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#ECECEC' }}>
        <p style={{ color: '#2C3E50', fontSize: '1.125rem', animation: 'pulse 2s infinite' }}>Carregando perfil...</p>
      </div>
    );

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '1rem', paddingBottom: '1rem', backgroundColor: '#ECECEC' }}>
      {!isEditing && (
        <div style={{ width: containerWidth, backgroundColor: '#ECECEC', borderRadius: '1.5rem', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1),0 4px 6px -2px rgba(0,0,0,0.05)', padding: '1.5rem', marginTop: '4rem', position: 'relative' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', textAlign: 'center', marginBottom: '1.5rem', color: '#000' }}>
            Perfil {perfil.tipoUsuario === 'empresa' ? 'da Empresa' : 'Pessoal'}
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '1.5rem', position: 'relative' }}>
            <div style={{ width: '8rem', height: '8rem', borderRadius: '9999px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#E6E69D' }}>
              {perfil.fotoURL && <img src={perfil.fotoURL} alt="Foto de Perfil" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
              {isMeuPerfil && <button onClick={() => setIsEditing(true)} style={{ position: 'absolute', bottom: 0, right: '50%', transform: 'translateX(50%)', width: '2rem', height: '2rem', borderRadius: '9999px', cursor: 'pointer', backgroundColor: '#E6E69D', border: 'none' }}>✎</button>}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ padding: '0.75rem', borderRadius: '9999px', border: '1px solid #D9D9D9', backgroundColor: '#fff', textAlign: 'center' }}>
              {perfil.tipoUsuario === 'pcd' ? `Nome: ${perfil.nome}` : `Nome da Empresa: ${perfil.nome}`}
            </div>
            <div style={{ padding: '0.75rem', borderRadius: '9999px', border: '1px solid #D9D9D9', backgroundColor: '#fff', textAlign: 'center' }}>
              Email: {perfil.email || 'Não informado'}
            </div>
            {perfil.tipoUsuario === 'pcd' ? (
              <>
                <div style={{ padding: '0.75rem', borderRadius: '9999px', border: '1px solid #D9D9D9', backgroundColor: '#fff', textAlign: 'center' }}>
                  Telefone: {perfil.telefone || 'Não informado'}
                </div>
                <div style={{ padding: '0.75rem', borderRadius: '9999px', border: '1px solid #D9D9D9', backgroundColor: '#fff', textAlign: 'center' }}>
                  Data de nascimento: {perfil.dataNascimento || 'Não informada'}
                </div>
                {perfil.tipoDeficiencia && (
                  <div style={{ padding: '0.75rem', borderRadius: '9999px', border: '1px solid #D9D9D9', backgroundColor: '#fff', textAlign: 'center' }}>
                    Tipo de deficiência: {perfil.tipoDeficiencia}
                  </div>
                )}
                {perfil.deficiencia && (
                  <div style={{ padding: '0.75rem', borderRadius: '9999px', border: '1px solid #D9D9D9', backgroundColor: '#fff', textAlign: 'center' }}>
                    Deficiência específica: {perfil.deficiencia}
                  </div>
                )}
              </>
            ) : (
              <>
                <div style={{ padding: '0.75rem', borderRadius: '9999px', border: '1px solid #D9D9D9', backgroundColor: '#fff', textAlign: 'center' }}>
                  Razão Social: {perfil.razaoSocial || 'Não informada'}
                </div>
                <div style={{ padding: '0.75rem', borderRadius: '9999px', border: '1px solid #D9D9D9', backgroundColor: '#fff', textAlign: 'center' }}>
                  CNPJ: {perfil.cnpj || 'Não informado'}
                </div>
              </>
            )}
          </div>
        </div>
      )}
      {isEditing && isMeuPerfil && (
        <div style={{ width: containerWidth, backgroundColor: '#ECECEC', borderRadius: '1.5rem', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1),0 4px 6px -2px rgba(0,0,0,0.05)', padding: '1.5rem', marginTop: '4rem', position: 'relative' }}>
          <button onClick={() => setIsEditing(false)} style={{ position: 'absolute', left: '1rem', top: '1rem', width: '2.5rem', height: '2.5rem', borderRadius: '9999px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#D9D9D9', border: 'none', cursor: 'pointer' }}>←</button>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', textAlign: 'center', marginBottom: '1.5rem', color: '#000' }}>Editar perfil</h2>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '1.5rem', position: 'relative' }}>
            <div style={{ width: '8rem', height: '8rem', borderRadius: '9999px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#E6E69D', position: 'relative' }}>
              {perfil.fotoURL && <img src={perfil.fotoURL} alt="Foto de Perfil" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
              <label htmlFor="file-input" style={{ position: 'absolute', bottom: 0, right: '50%', transform: 'translateX(50%)', width: '2rem', height: '2rem', borderRadius: '9999px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', backgroundColor: '#E6E69D' }}>
                <input id="file-input" type="file" onChange={handleImageChange} style={{ display: 'none' }} />✎
              </label>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '1rem' }}>
              <label style={{ display: 'flex', alignItems: 'center' }}>
                <input type="radio" name="tipoUsuario" value="pcd" checked={perfil.tipoUsuario === 'pcd'} onChange={handleChange} style={{ marginRight: '0.5rem' }} disabled={uploading} />
                PCD
              </label>
              <label style={{ display: 'flex', alignItems: 'center' }}>
                <input type="radio" name="tipoUsuario" value="empresa" checked={perfil.tipoUsuario === 'empresa'} onChange={handleChange} style={{ marginRight: '0.5rem' }} disabled={uploading} />
                Empresa
              </label>
            </div>
            <input type="text" name="nome" placeholder={perfil.tipoUsuario === 'pcd' ? 'Nome Completo' : 'Nome da Empresa'} value={perfil.nome} onChange={handleChange} style={{ padding: '0.75rem', borderRadius: '9999px', border: '1px solid #D9D9D9' }} disabled={uploading} />
            {perfil.tipoUsuario === 'pcd' ? (
              <>
                <input type="tel" name="telefone" placeholder="Telefone" value={perfil.telefone} onChange={handleChange} style={{ padding: '0.75rem', borderRadius: '9999px', border: '1px solid #D9D9D9' }} disabled={uploading} />
                <input type="text" name="dataNascimento" placeholder="Data de nascimento" value={perfil.dataNascimento} onChange={handleChange} style={{ padding: '0.75rem', borderRadius: '9999px', border: '1px solid #D9D9D9' }} disabled={uploading} />
                <select name="tipoDeficiencia" value={perfil.tipoDeficiencia} onChange={handleChange} style={{ padding: '0.75rem', borderRadius: '9999px', border: '1px solid #D9D9D9' }} disabled={uploading}>
                  <option value="">Selecione o tipo de deficiência</option>
                  {tiposDeficiencia.map((tipo) => <option key={tipo} value={tipo}>{tipo}</option>)}
                </select>
                <select name="deficiencia" value={perfil.deficiencia} onChange={handleChange} style={{ padding: '0.75rem', borderRadius: '9999px', border: '1px solid #D9D9D9' }} disabled={uploading || !perfil.tipoDeficiencia}>
                  <option value="">Selecione a deficiência</option>
                  {perfil.tipoDeficiencia && opcoesDeficiencia[perfil.tipoDeficiencia] && opcoesDeficiencia[perfil.tipoDeficiencia].map((opc) => <option key={opc} value={opc}>{opc}</option>)}
                </select>
              </>
            ) : (
              <>
                <input type="text" name="razaoSocial" placeholder="Razão Social" value={perfil.razaoSocial} onChange={handleChange} style={{ padding: '0.75rem', borderRadius: '9999px', border: '1px solid #D9D9D9' }} disabled={uploading} />
                <input type="text" name="cnpj" placeholder="CNPJ" value={perfil.cnpj} onChange={handleChange} style={{ padding: '0.75rem', borderRadius: '9999px', border: '1px solid #D9D9D9' }} disabled={uploading} />
              </>
            )}
            <button type="button" onClick={handleSave} style={{ padding: '0.75rem', borderRadius: '9999px', fontWeight: 'bold', backgroundColor: '#E6E69D', border: 'none', cursor: 'pointer' }} disabled={uploading}>{uploading ? 'Salvando...' : 'Concluir'}</button>
          </div>
        </div>
      )}
    </div>
  );
}