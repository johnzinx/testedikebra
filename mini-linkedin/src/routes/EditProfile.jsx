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

  if (loading) return <p>Carregando dados...</p>

  return (
    <div className="max-w-xl mx-auto p-4 space-y-4">
      <h2 className="text-xl font-bold">Editar Perfil</h2>
      <input name="nome" value={form.nome} onChange={handleChange} className="w-full p-2 border" placeholder="Nome" />
      <textarea name="bio" value={form.bio} onChange={handleChange} className="w-full p-2 border" placeholder="Bio" />
      <input name="skills" value={form.skills} onChange={handleChange} className="w-full p-2 border" placeholder="Skills (separadas por vírgula)" />
      <input name="experiencias" value={form.experiencias} onChange={handleChange} className="w-full p-2 border" placeholder="Experiências (separadas por vírgula)" />
      <button onClick={salvar} className="bg-blue-500 text-white px-4 py-2 rounded">Salvar</button>
    </div>
  )
}
