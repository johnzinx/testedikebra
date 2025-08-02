import { useState } from 'react'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db } from '../services/firebase'
import useAuthStore from '../store/useAuth'

export default function PostBox() {
  const [texto, setTexto] = useState('')
  const { user } = useAuthStore()
const postar = async () => {
  if (!texto.trim()) return

  await addDoc(collection(db, 'posts'), {
    texto,
    criadoEm: serverTimestamp(),
    autor: {
      uid: user.uid,
      nome: user.displayName || 'Anônimo',
      email: user.email,
    },
    curtidas: [],         // ← inicia vazio
    comentarios: []       // ← inicia vazio também
  })

  setTexto('')
}

  return (
    <div className="bg-white p-4 rounded shadow mb-4">
      <textarea
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        placeholder="O que você está pensando, campeão?"
        className="w-full border rounded p-2 resize-none"
        rows={3}
      />
      <button
        onClick={postar}
        className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Publicar
      </button>
    </div>
  )
}
