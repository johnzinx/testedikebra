import { useState } from 'react'
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { useNavigate } from 'react-router-dom'
import { auth } from '../services/firebase'
import useAuth from '../store/useAuth'

export default function Register() {
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)
  const navigate = useNavigate()

  const { setUser } = useAuth()

  const registrar = async () => {
    setErro('')
    setCarregando(true)

    try {
      const cred = await createUserWithEmailAndPassword(auth, email, senha)

      await updateProfile(cred.user, {
        displayName: nome,
      })

      setUser(cred.user)
      navigate('/')
    } catch (err) {
      console.error(err)
      setErro('Erro ao registrar usuário')
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-md space-y-4">
        <h2 className="text-2xl font-bold text-center">Criar Conta</h2>

        <input
          type="text"
          placeholder="Nome"
          className="w-full p-2 border rounded"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
        />

        <input
          type="email"
          placeholder="Email"
          className="w-full p-2 border rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Senha"
          className="w-full p-2 border rounded"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
        />

        {erro && <div className="text-red-600 text-sm">{erro}</div>}

        <button
          onClick={registrar}
          disabled={carregando}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          {carregando ? 'Registrando...' : 'Criar Conta'}
        </button>
      </div>
    </div>
  )
}
