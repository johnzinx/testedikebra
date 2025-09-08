import { useEffect, useState } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import useAuth from '../store/useAuth';

export default function Profile() {
  const { user, profileData, updateProfilePicture } = useAuth();
  const [perfil, setPerfil] = useState({
    nome: '',
    telefone: '',
    email: '',
    dataNascimento: '',
    fotoURL: '',
  });
  const [carregando, setCarregando] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [imagemPerfil, setImagemPerfil] = useState(null);
  const [uploading, setUploading] = useState(false);

  const CLOUDINARY_CLOUD_NAME = 'del48up33';
  const CLOUDINARY_UPLOAD_PRESET = 'dkebra';

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!user) {
      setCarregando(false);
      return;
    }
    if (profileData) {
      setPerfil({
        ...profileData,
        email: user.email,
      });
      setCarregando(false);
    } else {
      // Se os dados ainda não foram carregados, esperamos o `useAuth` fazer isso.
      const unsubscribe = useAuth.subscribe(
        (state) => state.profileData,
        (profile) => {
          if (profile) {
            setPerfil({
              ...profile,
              email: user.email,
            });
            setCarregando(false);
            unsubscribe();
          }
        }
      );
      return unsubscribe;
    }
  }, [user, profileData]);

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
    if (!user) return;
    setUploading(true);

    try {
      let novaFotoURL = perfil.fotoURL;

      if (imagemPerfil) {
        const formData = new FormData();
        formData.append('file', imagemPerfil);
        formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

        const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Erro no upload para o Cloudinary');
        }

        const data = await response.json();
        novaFotoURL = data.secure_url;
        updateProfilePicture(novaFotoURL);
      }

      const docRef = doc(db, 'users', user.uid);
      await setDoc(docRef, { ...perfil, fotoURL: novaFotoURL }, { merge: true });

      console.log('Perfil e foto atualizados com sucesso!');
      setIsEditing(false);
    } catch (error) {
      console.error('Erro ao salvar o perfil:', error);
    } finally {
      setUploading(false);
      setImagemPerfil(null);
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
        <div style={{ width: containerWidth, backgroundColor: '#ECECEC', borderRadius: '1.5rem', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)', padding: '1.5rem', marginTop: '4rem', position: 'relative' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', textAlign: 'center', marginBottom: '1.5rem', color: '#000' }}>Perfil</h2>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '1.5rem', position: 'relative' }}>
            <div style={{ width: '8rem', height: '8rem', borderRadius: '9999px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#E6E69D', position: 'relative' }}>
              {perfil.fotoURL ? (
                <img src={perfil.fotoURL} alt="Foto de Perfil" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="#D9D9D9">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.93 0 3.5 1.57 3.5 3.5S13.93 12 12 12s-3.5-1.57-3.5-3.5S10.07 5 12 5zm0 14.9c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              )}
            </div>
            <button
              onClick={() => setIsEditing(true)}
              style={{ position: 'absolute', bottom: '0', right: '50%', transform: 'translateX(50%)', width: '2rem', height: '2rem', borderRadius: '9999px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', cursor: 'pointer', backgroundColor: '#E6E69D', border: 'none' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="currentColor" style={{ color: '#000' }}>
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zm-7.586 5.586L3 17.172v-4.145l6.5-6.5L13.172 8l-6.5 6.5z" />
              </svg>
            </button>
          </div>

     

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ padding: '0.75rem', borderRadius: '9999px', border: '1px solid #D9D9D9', backgroundColor: '#fff', color: '#000', textAlign: 'center' }}>
              {perfil.nome || 'Nome e sobrenome não informados'}
            </div>
            <div style={{ padding: '0.75rem', borderRadius: '9999px', border: '1px solid #D9D9D9', backgroundColor: '#fff', color: '#000', textAlign: 'center' }}>
              {perfil.cpf || 'CPF não informado'}
            </div>
            <div style={{ padding: '0.75rem', borderRadius: '9999px', border: '1px solid #D9D9D9', backgroundColor: '#fff', color: '#000', textAlign: 'center' }}>
              {perfil.telefone || 'Telefone não informado'}
            </div>
            <div style={{ padding: '0.75rem', borderRadius: '9999px', border: '1px solid #D9D9D9', backgroundColor: '#fff', color: '#000', textAlign: 'center' }}>
              {perfil.email || 'Email não informado'}
            </div>
            <div style={{ padding: '0.75rem', borderRadius: '9999px', border: '1px solid #D9D9D9', backgroundColor: '#fff', color: '#000', textAlign: 'center' }}>
              {perfil.dataNascimento || 'Data de nascimento não informada'}
            </div>
          </div>

        </div>
      )}

      {isEditing && (
        <div style={{ width: containerWidth, backgroundColor: '#ECECEC', borderRadius: '1.5rem', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.06)', padding: '1.5rem', marginTop: '4rem', position: 'relative' }}>
          <button
            onClick={() => setIsEditing(false)}
            style={{ position: 'absolute', left: '1rem', top: '1rem', width: '2.5rem', height: '2.5rem', borderRadius: '9999px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#D9D9D9', border: 'none', cursor: 'pointer' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: '#000' }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>

          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', textAlign: 'center', marginBottom: '1.5rem', color: '#000' }}>Editar perfil</h2>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '1.5rem', position: 'relative' }}>
            <div style={{ width: '8rem', height: '8rem', borderRadius: '9999px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#E6E69D', position: 'relative' }}>
              {perfil.fotoURL ? (
                <img src={perfil.fotoURL} alt="Foto de Perfil" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="#D9D9D9">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.93 0 3.5 1.57 3.5 3.5S13.93 12 12 12s-3.5-1.57-3.5-3.5S10.07 5 12 5zm0 14.9c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              )}
            </div>

            <label htmlFor="file-input" style={{ position: 'absolute', bottom: '0', right: '50%', transform: 'translateX(50%)', width: '2rem', height: '2rem', borderRadius: '9999px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', cursor: 'pointer', backgroundColor: '#E6E69D' }}>
              <input id="file-input" type="file" onChange={handleImageChange} style={{ display: 'none' }} />
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="currentColor" style={{ color: '#000' }}>
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zm-7.586 5.586L3 17.172v-4.145l6.5-6.5L13.172 8l-6.5 6.5z" />
              </svg>
            </label>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input
              type="text"
              name="nome"
              placeholder="Nome e sobrenome"
              value={perfil.nome}
              onChange={handleChange}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '9999px', border: '1px solid #D9D9D9', outline: 'none', backgroundColor: '#fff', color: '#000' }}
              disabled={uploading}
            />
            <input
              type="tel"
              name="telefone"
              placeholder="Telefone"
              value={perfil.telefone}
              onChange={handleChange}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '9999px', border: '1px solid #D9D9D9', outline: 'none', backgroundColor: '#fff', color: '#000' }}
              disabled={uploading}
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={perfil.email}
              onChange={handleChange}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '9999px', border: '1px solid #D9D9D9', outline: 'none', backgroundColor: '#fff', color: '#000' }}
              disabled
            />
            <input
              type="password"
              name="senha"
              placeholder="Senha"
              value={perfil.senha}
              onChange={handleChange}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '9999px', border: '1px solid #D9D9D9', outline: 'none', backgroundColor: '#fff', color: '#000' }}
              disabled={uploading}
            />

            <div style={{ marginTop: '0.5rem' }}>
              <label style={{ color: '#000', marginBottom: '0.5rem', display: 'block' }}>Data de Nascimento:</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  name="dataNascimento"
                  placeholder="00 / 00 / 0000"
                  value={perfil.dataNascimento}
                  onChange={handleChange}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '9999px', border: '1px solid #D9D9D9', outline: 'none', backgroundColor: '#fff', color: '#000' }}
                  disabled={uploading}
                />
                <span style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#000' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </span>
              </div>
            </div>

            <button
              type="button"
              style={{ width: '100%', padding: '0.75rem', borderRadius: '9999px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#E6E69D', color: '#000', border: 'none', cursor: 'pointer', marginTop: '1rem' }}
            >
              Adicionar Currículo
            </button>

            <button
              type="button"
              onClick={handleSave}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '9999px', fontWeight: 'bold', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', backgroundColor: '#E6E69D', color: '#000', border: 'none', cursor: 'pointer', marginTop: '1rem' }}
              disabled={uploading}
            >
              {uploading ? 'Salvando...' : 'Concluir'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}