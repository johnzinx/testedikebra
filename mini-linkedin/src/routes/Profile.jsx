import { useEffect, useState } from 'react'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '../services/firebase'
import useAuth from '../store/useAuth'

export default function Profile() {
  const { user } = useAuth()
  const [perfil, setPerfil] = useState(null)
  const [carregando, setCarregando] = useState(true)
  const [editando, setEditando] = useState(false)

  // Estados para edição
  const [nomeEdit, setNomeEdit] = useState('')
  const [bioEdit, setBioEdit] = useState('')
  const [experienciasEdit, setExperienciasEdit] = useState('')
  const [skillsEdit, setSkillsEdit] = useState('')

  useEffect(() => {
    if (!user) return

    const buscarPerfil = async () => {
      try {
        const docRef = doc(db, 'users', user.uid)
        const docSnap = await getDoc(docRef)

        if (docSnap.exists()) {
          const data = { ...docSnap.data(), uid: user.uid }
          setPerfil(data)

          // Preenche os estados de edição
          setNomeEdit(data.nome || '')
          setBioEdit(data.bio || '')
          setExperienciasEdit((data.experiencias || []).join(', '))
          setSkillsEdit((data.skills || []).join(', '))
        } else {
          setPerfil(null)
        }
      } catch (error) {
        console.error(error)
        setPerfil(null)
      } finally {
        setCarregando(false)
      }
    }

    buscarPerfil()
  }, [user])

  if (carregando)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-600 text-lg animate-pulse">Carregando perfil...</p>
      </div>
    )

  if (!perfil)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-red-500 text-lg font-semibold">Perfil não encontrado.</p>
      </div>
    )

  const salvarPerfil = async () => {
    try {
      const docRef = doc(db, 'users', user.uid)
      const experienciasArray = experienciasEdit
        .split(',')
        .map((e) => e.trim())
        .filter((e) => e.length > 0)

      const skillsArray = skillsEdit
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0)

      const novoPerfil = {
        ...perfil,
        nome: nomeEdit,
        bio: bioEdit,
        experiencias: experienciasArray,
        skills: skillsArray,
      }

      await setDoc(docRef, novoPerfil)
      setPerfil(novoPerfil)
      setEditando(false)
    } catch (error) {
      console.error('Erro ao salvar perfil:', error)
    }
  }

  if (editando) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold mb-6 text-gray-800 border-b pb-2">Editar Perfil</h1>

          <label className="block mb-5">
            <span className="text-gray-700 font-semibold">Nome</span>
            <input
              type="text"
              value={nomeEdit}
              onChange={(e) => setNomeEdit(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2
                         placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Seu nome"
            />
          </label>

          <label className="block mb-5">
            <span className="text-gray-700 font-semibold">Bio</span>
            <textarea
              value={bioEdit}
              onChange={(e) => setBioEdit(e.target.value)}
              rows={4}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2
                         placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Conte um pouco sobre você"
            />
          </label>

          <label className="block mb-5">
            <span className="text-gray-700 font-semibold">Experiências (separe por vírgula)</span>
            <input
              type="text"
              value={experienciasEdit}
              onChange={(e) => setExperienciasEdit(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2
                         placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: Dev Frontend, Designer, Gerente"
            />
          </label>

          <label className="block mb-8">
            <span className="text-gray-700 font-semibold">Skills (separe por vírgula)</span>
            <input
              type="text"
              value={skillsEdit}
              onChange={(e) => setSkillsEdit(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2
                         placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: React, Node.js, Photoshop"
            />
          </label>

          <div className="flex justify-end gap-3">
            <button
              onClick={() => setEditando(false)}
              className="px-5 py-2 rounded-md bg-gray-300 text-gray-700 hover:bg-gray-400 transition"
            >
              Cancelar
            </button>
            <button
              onClick={salvarPerfil}
              className="px-5 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition"
            >
              Salvar
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-3xl w-full bg-white rounded-lg shadow-lg p-8">
        <div className="flex items-center justify-between gap-6">
          <div className="flex flex-col items-center text-center">
            {/* Foto placeholder circular */}
            <div className="w-28 h-28 bg-blue-200 rounded-full flex items-center justify-center text-4xl font-bold text-blue-700 select-none">
              {perfil.nome ? perfil.nome[0].toUpperCase() : '?'}
            </div>

            <h1 className="mt-4 text-3xl font-extrabold text-gray-900">{perfil.nome}</h1>
            <p className="text-gray-600">{perfil.email}</p>
          </div>

          {user?.uid === perfil.uid && (
            <button
              onClick={() => setEditando(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700
                         shadow-md transition font-semibold"
            >
              Editar Perfil
            </button>
          )}
        </div>

        <section className="mt-10">
          <h2 className="text-2xl font-bold mb-3 border-b border-gray-300 pb-1">Bio</h2>
          <p className="text-gray-700 leading-relaxed">{perfil.bio || 'Sem bio ainda.'}</p>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-bold mb-3 border-b border-gray-300 pb-1">Experiências</h2>
          {perfil.experiencias?.length ? (
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              {perfil.experiencias.map((exp, idx) => (
                <li key={idx}>{exp}</li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 italic">Nenhuma experiência cadastrada.</p>
          )}
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-bold mb-3 border-b border-gray-300 pb-1">Skills</h2>
          {perfil.skills?.length ? (
            <ul className="flex flex-wrap gap-3">
              {perfil.skills.map((skill, idx) => (
                <li
                  key={idx}
                  className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-semibold"
                >
                  {skill}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 italic">Nenhuma skill cadastrada.</p>
          )}
        </section>
      </div>
    </div>
  )
}
