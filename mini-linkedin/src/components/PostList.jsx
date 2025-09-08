import { useEffect, useState } from 'react'
import { collection, query, orderBy, onSnapshot, doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore'
import { db } from '../services/firebase'
import useAuthStore from '../store/useAuth'
 
export default function PostList() {
  const [posts, setPosts] = useState([])
  const { user, profileData } = useAuthStore()
  const [comentando, setComentando] = useState({})
  const [textoComentario, setTextoComentario] = useState({})
 
  useEffect(() => {
    const q = query(collection(db, 'posts'), orderBy('criadoEm', 'desc'))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const lista = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setPosts(lista)
    })
    return () => unsubscribe()
  }, [])
 
  const curtirPost = async (postId, curtidas) => {
    const postRef = doc(db, 'posts', postId)
    const jaCurtiu = curtidas?.includes(user.uid)
 
    await updateDoc(postRef, {
      curtidas: jaCurtiu
        ? arrayRemove(user.uid)
        : arrayUnion(user.uid)
    })
  }
 
  const comentarPost = async (postId) => {
    const postRef = doc(db, 'posts', postId)
    const novoComentario = {
      uid: user.uid,
      nome: profileData?.nome || user.displayName || 'Anônimo',
      texto: textoComentario[postId],
      criadoEm: new Date()
    }
 
    await updateDoc(postRef, {
      comentarios: arrayUnion(novoComentario)
    })
 
    setTextoComentario(prev => ({ ...prev, [postId]: '' }))
    setComentando(prev => ({ ...prev, [postId]: false }))
  }
 
  const deletarPost = async (postId) => {
    const postRef = doc(db, 'posts', postId)
    if (window.confirm('Tem certeza que quer deletar esse post?')) {
      await postRef.delete()
    }
  }
 
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {posts.map(post => {
        const curtiu = post.curtidas?.includes(user.uid)
        return (
          <div
            key={post.id}
            style={{
              backgroundColor: 'white',
              padding: '1rem',
              borderRadius: '0.5rem',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
            }}
          >
            <div style={{ fontSize: '0.875rem', color: '#4b5563' }}>
              {post.autor?.nome || post.autor?.email || 'Anônimo'}
            </div>
            <p style={{ marginTop: '0.25rem', color: '#1f2937' }}>{post.texto}</p>
 
            {/* Botões */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.75rem' }}>
              <button
                onClick={() => curtirPost(post.id, post.curtidas || [])}
                style={{
                  fontSize: '0.875rem',
                  color: curtiu ? '#2563eb' : '#6b7280',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  transition: 'color 0.2s',
                  fontWeight: 'bold'
                }}
              >
                👍 Curtir ({post.curtidas?.length || 0})
              </button>
 
              <button
                onClick={() => setComentando(prev => ({ ...prev, [post.id]: !prev[post.id] }))}
                style={{
                  fontSize: '0.875rem',
                  color: '#6b7280',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  transition: 'color 0.2s'
                }}
              >
                💬 Comentar
              </button>
 
              {user.uid === post.autor?.uid && (
                <button
                  onClick={() => deletarPost(post.id)}
                  style={{
                    fontSize: '0.875rem',
                    color: '#ef4444',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                    transition: 'color 0.2s'
                  }}
                >
                  🗑️ Excluir
                </button>
              )}
            </div>
 
            {/* Comentário */}
            {comentando[post.id] && (
              <div style={{ marginTop: '0.5rem' }}>
                <input
                  value={textoComentario[post.id] || ''}
                  onChange={(e) => setTextoComentario(prev => ({ ...prev, [post.id]: e.target.value }))}
                  placeholder="Escreva um comentário"
                  style={{
                    border: '1px solid #e2e8f0',
                    borderRadius: '0.25rem',
                    padding: '0.25rem',
                    width: '100%',
                    boxSizing: 'border-box',
                    outline: 'none'
                  }}
                />
                <button
                  onClick={() => comentarPost(post.id)}
                  style={{
                    marginTop: '0.25rem',
                    fontSize: '0.875rem',
                    backgroundColor: '#e5e7eb',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '0.25rem',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#d1d5db'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#e5e7eb'}
                >
                  Enviar
                </button>
              </div>
            )}
 
            {/* Lista de comentários */}
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
        )
      })}
    </div>
  )
}