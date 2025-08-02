import { useEffect, useState } from 'react'
import { collection, query, orderBy, onSnapshot, doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore'
import { db } from '../services/firebase'
import useAuthStore from '../store/useAuth'

export default function PostList() {
  const [posts, setPosts] = useState([])
  const { user } = useAuthStore()
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
      nome: user.displayName || 'Anônimo',
      texto: textoComentario[postId],
      criadoEm: new Date()
    }

    await updateDoc(postRef, {
      comentarios: arrayUnion(novoComentario)
    })

    setTextoComentario((prev) => ({ ...prev, [postId]: '' }))
    setComentando((prev) => ({ ...prev, [postId]: false }))
  }

  const deletarPost = async (postId) => {
    const postRef = doc(db, 'posts', postId)
    if (confirm('Tem certeza que quer deletar esse post?')) {
      await postRef.delete()
    }
  }

  return (
    <div className="space-y-4">
      {posts.map(post => {
        const curtiu = post.curtidas?.includes(user.uid)
        return (
          <div key={post.id} className="bg-white p-4 rounded shadow">
            <div className="text-sm text-gray-600">{post.autor.nome || post.autor.email}</div>
            <p className="mt-1 text-gray-800">{post.texto}</p>

            {/* Botões */}
            <div className="flex items-center gap-4 mt-3">
              <button
                onClick={() => curtirPost(post.id, post.curtidas || [])}
                className={`text-sm ${curtiu ? 'text-blue-600' : 'text-gray-500'}`}
              >
                👍 Curtir ({post.curtidas?.length || 0})
              </button>

              <button
                onClick={() => setComentando(prev => ({ ...prev, [post.id]: !prev[post.id] }))}
                className="text-sm text-gray-500"
              >
                💬 Comentar
              </button>

              {user.uid === post.autor.uid && (
                <button
                  onClick={() => deletarPost(post.id)}
                  className="text-sm text-red-500"
                >
                  🗑️ Excluir
                </button>
              )}
            </div>

            {/* Comentário */}
            {comentando[post.id] && (
              <div className="mt-2">
                <input
                  value={textoComentario[post.id] || ''}
                  onChange={(e) =>
                    setTextoComentario(prev => ({ ...prev, [post.id]: e.target.value }))
                  }
                  placeholder="Escreva um comentário"
                  className="border rounded p-1 w-full"
                />
                <button
                  onClick={() => comentarPost(post.id)}
                  className="mt-1 text-sm bg-gray-200 px-2 py-1 rounded"
                >
                  Enviar
                </button>
              </div>
            )}

            {/* Lista de comentários */}
            {post.comentarios?.map((c, i) => (
              <div key={i} className="mt-2 text-sm text-gray-700 border-t pt-1">
                <strong>{c.nome}: </strong> {c.texto}
              </div>
            ))}
          </div>
        )
      })}
    </div>
  )
}
