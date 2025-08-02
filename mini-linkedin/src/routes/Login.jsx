import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../services/firebase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [isCadastro, setIsCadastro] = useState(false)
  const [erro, setErro] = useState(null)
  const navigate = useNavigate()

  const enviar = async (e) => {
    e.preventDefault()
    try {
      if (isCadastro) {
        await createUserWithEmailAndPassword(auth, email, senha)
      } else {
        await signInWithEmailAndPassword(auth, email, senha)
      }
      navigate('/feed')
    } catch (err) {
      setErro(err.message)
    }
  }

  return (
    <div className="centered">
      <form className="card" onSubmit={enviar}>
        <h2>{isCadastro ? 'Criar conta' : 'Entrar'}</h2>
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Senha" value={senha} onChange={(e) => setSenha(e.target.value)} required />
        {erro && <small className="muted">{erro}</small>}
        <button type="submit" className="btn primary">
          {isCadastro ? 'Cadastrar' : 'Entrar'}
        </button>
        <button type="button" className="btn outline" onClick={() => setIsCadastro(!isCadastro)}>
          {isCadastro ? 'Já tenho conta' : 'Quero me cadastrar'}
        </button>
      </form>
    </div>
  )
}
