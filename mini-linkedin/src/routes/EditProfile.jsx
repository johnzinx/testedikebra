import { useEffect, useState } from 'react'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { db } from '../services/firebase'
import { useParams, useNavigate } from 'react-router-dom'

export default function EditProfile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    nome: '',
    bio: '',
    skills: '',
    experiencias: '',
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      const ref = doc(db, 'users', id)
      const snap = await getDoc(ref)
      if (snap.exists()) {
        const data = snap.data()
        setForm({
          nome: data.nome || '',
          bio: data.bio || '',
          skills: data.skills?.join(', ') || '',
          experiencias: data.experiencias?.join(', ') || '',
        })
      }
      setLoading(false)
    }

    fetchData()
  }, [id])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const salvar = async () => {
    const ref = doc(db, 'users', id)
    await updateDoc(ref, {
      nome: form.nome,
      bio: form.bio,
      skills: form.skills.split(',').map(s => s.trim()),
      experiencias: form.experiencias.split(',').map(e => e.trim())
    })
    navigate(`/profile/${id}`)
  }

  if (loading) return <p className="text-center text-gray-600">Carregando dados..
.</p>

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-lg rounded-2xl w-full max-w-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Editar Perfil</h2>

        <div className="space-y-4">
          <input
            name="nome"
            value={form.nome}
            onChange={handleChange}
            className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Nome"
          />
          <textarea
            name="bio"
            value={form.bio}
            onChange={handleChange}
            rows="4"
            className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            placeholder="Bio"
          />
          <input
            name="skills"
            value={form.skills}
            onChange={handleChange}
            className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Skills (separadas por vírgula)"
          />
          <input
            name="experiencias"
            value={form.experiencias}
            onChange={handleChange}
            className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Experiências (separadas por vírgula)"
          />
        </div>

        <button
          onClick={salvar}
          className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-all duration-200 shadow-md"
        >
          Salvar
        </button>
      </div>
    </div>
  )
}
