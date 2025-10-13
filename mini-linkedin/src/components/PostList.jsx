import { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, arrayUnion, arrayRemove, addDoc, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import useAuthStore from '../store/useAuth';
import Profile from '../routes/Profile';
import Messages from '../routes/Messages';
import PostBox from './PostBox';

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

  useEffect(() => {
    const q = query(collection(db, 'posts'), orderBy('criadoEm', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const lista = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPosts(lista);
    });
    return () => unsubscribe();
  }, []);

  const curtirPost = async (postId, curtidas, postAutorUid) => {
    if (!user) return;
    
    const postRef = doc(db, 'posts', postId);
    const jaCurtiu = curtidas?.includes(user.uid);
    
    // 1. Atualiza o array de curtidas do post
    await updateDoc(postRef, {
      curtidas: jaCurtiu ? arrayRemove(user.uid) : arrayUnion(user.uid),
    });

    // 2. CRIA A NOTIFICAÇÃO de like, se curtiu e não é o próprio autor
    if (!jaCurtiu && user.uid !== postAutorUid) {
      try {
        await addDoc(collection(db, 'notifications'), {
          recipientUid: postAutorUid, // O UID do dono do post
          senderName: profileData?.nome || user.displayName || 'Alguém',
          senderUid: user.uid,
          type: 'like',
          message: `${profileData?.nome || user.displayName || 'Alguém'} curtiu seu post.`,
          createdAt: serverTimestamp(),
          read: false, 
        });
      } catch (error) {
        console.error('Erro ao criar notificação de like:', error);
      }
    }
  };

  const comentarPost = async (postId, postAutorUid) => {
    if (!user) return;

    const texto = textoComentario[postId];
    if (!texto || !texto.trim()) return;

    const postRef = doc(db, 'posts', postId);
    const novoComentario = {
      uid: user.uid,
      nome: profileData?.nome || user.displayName || 'Anônimo',
      texto: texto,
      criadoEm: new Date(),
    };

    // 1. Adiciona o comentário ao post
    await updateDoc(postRef, {
      comentarios: arrayUnion(novoComentario),
    });
    setTextoComentario(prev => ({ ...prev, [postId]: '' }));
    setComentando(prev => ({ ...prev, [postId]: false }));
    
    // 2. CRIA A NOTIFICAÇÃO de comentário, se não é o dono do post
    if (user.uid !== postAutorUid) {
      try {
        await addDoc(collection(db, 'notifications'), {
          recipientUid: postAutorUid, // O UID do dono do post
          senderName: profileData?.nome || user.displayName || 'Alguém',
          senderUid: user.uid,
          type: 'comment',
          message: `${profileData?.nome || user.displayName} comentou: "${texto.substring(0, 30)}${texto.length > 30 ? '...' : ''}"`,
          createdAt: serverTimestamp(),
          read: false, 
        });
      } catch (error) {
          console.error('Erro ao criar notificação de comentário:', error);
      }
    }
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
    // ... (Retorno do Profile) ...
    return (
      <div>
        <button onClick={fecharPerfil} style={{ position: 'fixed', top: '1rem', left: '1rem', zIndex: 50, background: 'white', border: '1px solid #ccc', borderRadius: '50%', width: '2.5rem', height: '2.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 6px rgba(0,0,0,0.2)' }}>←</button>
        <Profile user={usuarioPerfil} />
      </div>
    );
  }

  if (chatAberto && chatSelecionado && usuarioChat) {
    // ... (Retorno do Messages) ...
    return (
      <div>
        <button onClick={fecharChat} style={{ position: 'fixed', top: '1rem', left: '1rem', zIndex: 50, background: 'white', border: '1px solid #ccc', borderRadius: '50%', width: '2.5rem', height: '2.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 6px rgba(0,0,0,0.2)' }}>←</button>
        <Messages selectedChat={chatSelecionado} userData={usuarioChat} />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      
      
      
      {/* Lista de posts */}
      {posts.map(post => {
        const curtiu = post.curtidas?.includes(user?.uid);
        return (
          <div key={post.id} style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '0.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 'bold', color: '#4b5563' }} onClick={() => abrirPerfil(post.autor)}>
              {/* IMAGEM CORRIGIDA */}
              <img src={post.autor?.fotoURL || 'https://placehold.co/40/cccccc/white'} alt="Foto de Perfil" style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
              <span>{post.autor?.nome || post.autor?.email || 'Anônimo'}</span>
            </div>
            <p style={{ marginTop: '0.25rem', color: '#1f2937' }}>{post.texto}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.75rem' }}>
              <button onClick={() => curtirPost(post.id, post.curtidas || [], post.autor.uid)} style={{ fontSize: '0.875rem', color: curtiu ? '#2563eb' : '#6b7280', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontWeight: 'bold' }}>
                👍 Curtir ({post.curtidas?.length || 0})
              </button>
              <button onClick={() => setComentando(prev => ({ ...prev, [post.id]: !prev[post.id] }))} style={{ fontSize: '0.875rem', color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                💬 Comentar
              </button>
              <button onClick={() => openChat(post.autor)} style={{ fontSize: '0.875rem', color: '#16a34a', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                📨 Chat
              </button>
              {user?.uid === post.autor?.uid && (
                <button onClick={() => deletarPost(post.id)} style={{ fontSize: '0.875rem', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                  🗑️ Excluir
                </button>
              )}
            </div>
            {comentando[post.id] && (
              <div style={{ marginTop: '0.5rem' }}>
                <input value={textoComentario[post.id] || ''} onChange={(e) => setTextoComentario(prev => ({ ...prev, [post.id]: e.target.value }))} placeholder="Escreva um comentário" style={{ border: '1px solid #e2e8f0', borderRadius: '0.25rem', padding: '0.25rem', width: '100%', boxSizing: 'border-box', outline: 'none' }} />
                <button onClick={() => comentarPost(post.id, post.autor.uid)} style={{ marginTop: '0.25rem', fontSize: '0.875rem', backgroundColor: '#e5e7eb', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', border: 'none', cursor: 'pointer' }}>
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
