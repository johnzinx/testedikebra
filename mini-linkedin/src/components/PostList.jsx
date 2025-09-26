import { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, arrayUnion, arrayRemove, addDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import useAuthStore from '../store/useAuth';
import Profile from '../routes/Profile';
import Messages from '../routes/Messages';

export default function PostList() {
  const [posts, setPosts] = useState([]);
  const { user, profileData } = useAuthStore();
  const [comentando, setComentando] = useState({});
  const [textoComentario, setTextoComentario] = useState({});
  const [perfilAberto, setPerfilAberto] = useState(false);
  const [usuarioPerfil, setUsuarioPerfil] = useState(null);
  const [chatAberto, setChatAberto] = useState(false);
  const [chatSelecionado, setChatSelecionado] = useState(null);
  const [usuarioChat, setUsuarioChat] = useState(null);
  const [postText, setPostText] = useState('');
  const [postLoading, setPostLoading] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'posts'), orderBy('criadoEm', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const lista = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPosts(lista);
    });
    return () => unsubscribe();
  }, []);

  // Nova função para criar um post
  const handleCreatePost = async () => {
    if (!postText.trim() || !user) return;

    setPostLoading(true);
    try {
      await addDoc(collection(db, 'posts'), {
        texto: postText,
        criadoEm: new Date(),
        autor: {
          uid: user.uid,
          nome: profileData?.nome || user.displayName || 'Anônimo',
          fotoURL: profileData?.fotoURL || user.photoURL || null,
        },
      });
      setPostText('');
    } catch (error) {
      console.error('Erro ao criar post:', error);
    } finally {
      setPostLoading(false);
    }
  };

  const curtirPost = async (postId, curtidas) => {
    const postRef = doc(db, 'posts', postId);
    const jaCurtiu = curtidas?.includes(user.uid);
    await updateDoc(postRef, {
      curtidas: jaCurtiu ? arrayRemove(user.uid) : arrayUnion(user.uid),
    });
  };

  const comentarPost = async (postId) => {
    const postRef = doc(db, 'posts', postId);
    const novoComentario = {
      uid: user.uid,
      nome: profileData?.nome || user.displayName || 'Anônimo',
      texto: textoComentario[postId],
      criadoEm: new Date(),
    };
    await updateDoc(postRef, {
      comentarios: arrayUnion(novoComentario),
    });
    setTextoComentario(prev => ({ ...prev, [postId]: '' }));
    setComentando(prev => ({ ...prev, [postId]: false }));
  };

  const deletarPost = async (postId) => {
    const postRef = doc(db, 'posts', postId);
    if (window.confirm('Tem certeza que quer deletar esse post?')) {
      try {
        await deleteDoc(postRef);
        console.log('Post deletado com sucesso!');
      } catch (error) {
        console.error('Erro ao deletar o post:', error);
        alert('Ocorreu um erro ao tentar deletar o post.');
      }
    }
  };

  const abrirPerfil = (perfilUsuario) => {
    setUsuarioPerfil(perfilUsuario);
    setPerfilAberto(true);
  };

  const fecharPerfil = () => {
    setUsuarioPerfil(null);
    setPerfilAberto(false);
  };

  const openChat = async (autor) => {
    let chatId = null;
    const q = query(collection(db, 'chats'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docs.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.participants?.includes(user.uid) && data.participants?.includes(autor.uid)) {
          chatId = docSnap.id;
        }
      });
    });
    unsubscribe();

    if (!chatId) {
      const chatRef = await addDoc(collection(db, 'chats'), {
        participants: [user.uid, autor.uid],
      });
      chatId = chatRef.id;
    }

    setChatSelecionado({ id: chatId });
    setUsuarioChat(autor);
    setChatAberto(true);
  };

  const fecharChat = () => {
    setChatAberto(false);
    setChatSelecionado(null);
    setUsuarioChat(null);
  };

  if (perfilAberto && usuarioPerfil) {
    return (
      <div>
        <button onClick={fecharPerfil} style={{ position: 'fixed', top: '1rem', left: '1rem', zIndex: 50, background: 'white', border: '1px solid #ccc', borderRadius: '50%', width: '2.5rem', height: '2.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 6px rgba(0,0,0,0.2)' }}>←</button>
        <Profile user={usuarioPerfil} />
      </div>
    );
  }

  if (chatAberto && chatSelecionado && usuarioChat) {
    return (
      <div>
        <button onClick={fecharChat} style={{ position: 'fixed', top: '1rem', left: '1rem', zIndex: 50, background: 'white', border: '1px solid #ccc', borderRadius: '50%', width: '2.5rem', height: '2.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 6px rgba(0,0,0,0.2)' }}>←</button>
        <Messages selectedChat={chatSelecionado} userData={usuarioChat} />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Formulário de criação de post */}
      <div style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: '#fff', borderRadius: '0.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
        <textarea
          value={postText}
          onChange={(e) => setPostText(e.target.value)}
          placeholder="O que você está pensando?"
          style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '0.25rem' }}
        />
        <button
          onClick={handleCreatePost}
          disabled={postLoading}
          style={{ marginTop: '0.5rem', padding: '0.5rem 1rem', backgroundColor: '#1d4ed8', color: '#fff', border: 'none', borderRadius: '0.25rem', cursor: 'pointer', opacity: postLoading ? 0.7 : 1 }}
        >
          {postLoading ? 'Publicando...' : 'Publicar'}
        </button>
      </div>
      
      {/* Lista de posts */}
      {posts.map(post => {
        const curtiu = post.curtidas?.includes(user.uid);
        return (
          <div key={post.id} style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '0.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 'bold', color: '#4b5563' }} onClick={() => abrirPerfil(post.autor)}>
              <img src={post.autor?.fotoURL || 'https://via.placeholder.com/40'} alt="Foto de Perfil" style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
              <span>{post.autor?.nome || post.autor?.email || 'Anônimo'}</span>
            </div>
            <p style={{ marginTop: '0.25rem', color: '#1f2937' }}>{post.texto}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.75rem' }}>
              <button onClick={() => curtirPost(post.id, post.curtidas || [])} style={{ fontSize: '0.875rem', color: curtiu ? '#2563eb' : '#6b7280', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontWeight: 'bold' }}>
                👍 Curtir ({post.curtidas?.length || 0})
              </button>
              <button onClick={() => setComentando(prev => ({ ...prev, [post.id]: !prev[post.id] }))} style={{ fontSize: '0.875rem', color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                💬 Comentar
              </button>
              <button onClick={() => openChat(post.autor)} style={{ fontSize: '0.875rem', color: '#16a34a', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                📨 Chat
              </button>
              {user.uid === post.autor?.uid && (
                <button onClick={() => deletarPost(post.id)} style={{ fontSize: '0.875rem', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                  🗑️ Excluir
                </button>
              )}
            </div>
            {comentando[post.id] && (
              <div style={{ marginTop: '0.5rem' }}>
                <input value={textoComentario[post.id] || ''} onChange={(e) => setTextoComentario(prev => ({ ...prev, [post.id]: e.target.value }))} placeholder="Escreva um comentário" style={{ border: '1px solid #e2e8f0', borderRadius: '0.25rem', padding: '0.25rem', width: '100%', boxSizing: 'border-box', outline: 'none' }} />
                <button onClick={() => comentarPost(post.id)} style={{ marginTop: '0.25rem', fontSize: '0.875rem', backgroundColor: '#e5e7eb', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', border: 'none', cursor: 'pointer' }}>
                  Enviar
                </button>
              </div>
            )}
            {post.comentarios?.length > 0 && (
              <div style={{ marginTop: '0.5rem', borderTop: '1px solid #e2e8f0', paddingTop: '0.5rem' }}>
                {post.comentarios.map((c, i) => (
                  <div key={i} style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#374151' }}>
                    <strong>{c.nome}: </strong> {c.texto}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}