import { useState } from 'react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../services/firebase';
import useAuthStore from '../store/useAuth';

export default function PostBox() {
  const { user, profileData } = useAuthStore(); // Pega user e profileData da store
  const [postText, setPostText] = useState(''); // Usa postText para o texto do post
  const [postLoading, setPostLoading] = useState(false); // Novo estado para o loading

  // Função para criar um post, equivalente ao handleCreatePost do PostList
  const handleCreatePost = async () => {
    // 1. Validação
    if (!postText.trim() || !user) {
      alert('Por favor, escreva algo antes de publicar e certifique-se de estar logado!');
      return;
    }

    setPostLoading(true); // Inicia o loading

    try {
      // 2. Adiciona o documento ao Firestore
      await addDoc(collection(db, 'posts'), {
        texto: postText,
        criadoEm: serverTimestamp(), // Usa serverTimestamp para garantir o tempo do servidor
        autor: {
          uid: user.uid,
          // Prioriza o nome e a foto de perfil do profileData se existir, senão usa os dados do user
          nome: profileData?.nome || user.displayName || 'Anônimo',
          fotoURL: profileData?.fotoURL || user.photoURL || null,
        },
        // Inicializa curtidas e comentários como arrays vazios
        curtidas: [],
        comentarios: [],
      });
      
      // 3. Limpa o campo após o sucesso
      setPostText(''); 
      // alert('Post publicado com sucesso!'); // Feedback opcional

    } catch (error) {
      console.error('Erro ao criar post:', error);
      alert('Ocorreu um erro ao publicar o post. Tente novamente.');
    } finally {
      setPostLoading(false); // Finaliza o loading
    }
  };

  return (
    <div
      style={{
        backgroundColor: 'white',
        padding: '1.5rem',
        borderRadius: '1rem',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        marginBottom: '1.5rem',
        border: '1px solid #e0e0e0',
        maxWidth: '600px',
        margin: '0 auto 1.5rem auto',
      }}
    >
      <h2 style={{
        fontSize: '1.5rem',
        fontWeight: '700',
        color: '#333',
        marginBottom: '1rem',
        textAlign: 'center',
      }}>
        Crie uma Nova Publicação 📝
      </h2>
      <textarea
        value={postText} // Usa postText
        onChange={(e) => setPostText(e.target.value)} // Atualiza postText
        placeholder="O que você está pensando hoje, campeão?"
        rows={4}
        style={{
          width: '100%',
          border: '1px solid #ccc',
          borderRadius: '0.5rem',
          padding: '1rem',
          resize: 'vertical',
          outline: 'none',
          transition: 'all 0.3s ease-in-out',
          fontFamily: 'inherit',
          fontSize: '1rem',
          boxSizing: 'border-box',
        }}
        onFocus={(e) => {
          e.target.style.borderColor = '#66b3ff';
          e.target.style.boxShadow = '0 0 0 3px rgba(102, 179, 255, 0.25)';
        }}
        onBlur={(e) => {
          e.target.style.borderColor = '#ccc';
          e.target.style.boxShadow = 'none';
        }}
        disabled={postLoading} // Desabilita durante o loading
      />
      <button
        onClick={handleCreatePost} // Chama a nova função
        disabled={postLoading || !postText.trim()} // Desabilita se estiver carregando ou vazio
        style={{
          marginTop: '1.25rem',
          backgroundColor: '#E53E3E',
          color: 'white',
          padding: '0.75rem 1.5rem',
          borderRadius: '0.5rem',
          border: 'none',
          cursor: 'pointer',
          transition: 'all 0.3s ease-in-out',
          fontSize: '1.1rem',
          fontWeight: '600',
          width: '100%',
          opacity: (postLoading || !postText.trim()) ? 0.6 : 1, // Feedback visual de desabilitado
        }}
        onMouseOver={(e) => e.currentTarget.style.backgroundColor = postLoading ? '#4CAF50' : '#45a049'}
        onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#4CAF50'}
      >
        {postLoading ? 'Publicando...' : 'Publicar'} {/* Feedback de loading */}
      </button>
    </div>
  );
}