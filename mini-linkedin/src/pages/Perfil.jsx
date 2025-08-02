import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../services/firebase'

export default function Perfil() {
  const { uid } = useParams()
  const [perfil, setPerfil] = useState(null)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    const buscarPerfil = async () => {
      try {
        const docRef = doc(db, 'users', uid)
        const docSnap = await getDoc(docRef)

        if (docSnap.exists()) {
          setPerfil(docSnap.data())
        } else {
          setPerfil(null) // perfil não encontrado
        }
      } catch (error) {
        console.error('Erro ao buscar perfil:', error)
        setPerfil(null)
      } finally {
        setCarregando(false)
      }
    }

    buscarPerfil()
  }, [uid])

  if (carregando) return <p>Carregando perfil...</p>
  if (!perfil) return <p>Perfil não encontrado.</p>

  return (
    <div className="max-w-2xl mx-auto p-4 bg-white rounded shadow">
      <h1 className="text-2xl font-bold">{perfil.nome}</h1>
      <p className="text-gray-600">{perfil.email}</p>

      <div className="mt-4">
        <h2 className="text-lg font-semibold">Bio</h2>
        <p>{perfil.bio || 'Sem bio ainda.'}</p>
      </div>

      <div className="mt-4">
        <h2 className="text-lg font-semibold">Experiências</h2>
        <ul className="list-disc list-inside">
          {perfil.experiencias?.length ? (
            perfil.experiencias.map((exp, idx) => (
              <li key={idx}>{exp}</li>
            ))
          ) : (
            <li>Nenhuma experiência cadastrada.</li>
          )}
        </ul>
      </div>

      <div className="mt-4">
        <h2 className="text-lg font-semibold">Skills</h2>
        <ul className="flex gap-2 flex-wrap">
          {perfil.skills?.length ? (
            perfil.skills.map((skill, idx) => (
              <li key={idx} className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                {skill}
              </li>
            ))
          ) : (
            <span>Nenhuma skill cadastrada.</span>
          )}
        </ul>
      </div>
    </div>
  )
}
