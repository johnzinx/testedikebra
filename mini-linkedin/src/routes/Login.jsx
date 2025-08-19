import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth'
import { auth } from '../services/firebase'
 
export default function Login() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [nome, setNome] = useState('')
  const [cpf, setCpf] = useState('')
  const [dataNascimento, setDataNascimento] = useState('')
  const [isCadastro, setIsCadastro] = useState(false)
  const [erro, setErro] = useState(null)
  const [sucesso, setSucesso] = useState(null)
  const navigate = useNavigate()
 
  const enviar = async (e) => {
    e.preventDefault()
    try {
      if (isCadastro) {
        // Criar conta
        await createUserWithEmailAndPassword(auth, email, senha)
        // Ações adicionais podem ser feitas aqui (salvar nome, cpf, data de nascimento em um banco, por exemplo)
        navigate('/feed')
      } else {
        // Login
        await signInWithEmailAndPassword(auth, email, senha)
        navigate('/feed')
      }
    } catch (err) {
      setErro(err.message)
    }
  }
 
  const handleEsqueciSenha = async () => {
    try {
      await sendPasswordResetEmail(auth, email)
      setSucesso('E-mail de redefinição de senha enviado com sucesso!')
    } catch (err) {
      setErro('Não foi possível enviar o e-mail de redefinição de senha.')
    }
  }
 
  return (
    <div className="profile-container">
      <form className="form-group" onSubmit={enviar}>
        <h2>{isCadastro ? 'Criar conta' : 'Entrar'}</h2>
       
        <div className="form-group">
          <label className="form-label">Email</label>
          <input
            type="email"
            className="form-input"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
 
        <div className="form-group">
          <label className="form-label">Senha</label>
          <input
            type="password"
            className="form-input"
            placeholder="Senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
          />
        </div>
 
        {isCadastro && (
          <>
            <div className="form-group">
              <label className="form-label">Nome Completo</label>
              <input
                type="text"
                className="form-input"
                placeholder="Seu nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
              />
            </div>
 
            <div className="form-group">
              <label className="form-label">CPF</label>
              <input
                type="text"
                className="form-input"
                placeholder="Seu CPF"
                value={cpf}
                onChange={(e) => setCpf(e.target.value)}
                required
              />
            </div>
 
            <div className="form-group">
              <label className="form-label">Data de Nascimento</label>
              <input
                type="date"
                className="form-input"
                value={dataNascimento}
                onChange={(e) => setDataNascimento(e.target.value)}
                required
              />
            </div>
          </>
        )}
 
        {erro && <small className="muted">{erro}</small>}
        {sucesso && <small className="success">{sucesso}</small>}
 
        <div className="form-buttons">
          <button type="submit" className="button-primary">
            {isCadastro ? 'Cadastrar' : 'Entrar'}
          </button>
          <button type="button" className="button-secondary" onClick={() => setIsCadastro(!isCadastro)}>
            {isCadastro ? 'Já tenho conta' : 'Quero me cadastrar'}
          </button>
 
          {!isCadastro && (
            <button type="button" className="button-secondary" onClick={handleEsqueciSenha}>
              Esqueci minha senha
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
 
 