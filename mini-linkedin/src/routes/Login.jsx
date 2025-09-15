import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithRedirect
} from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'
import { auth, db } from '../services/firebase'
import { FcGoogle } from "react-icons/fc"

// Importando a imagem da logo
import LogoImg from '../img/logodkebra.jpg'

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
    setErro(null)
    setSucesso(null)

    try {
      if (isCadastro) {
        const cred = await createUserWithEmailAndPassword(auth, email, senha)
        const uid = cred.user.uid

        await setDoc(doc(db, "users", uid), {
          nome,
          cpf,
          dataNascimento,
          email,
          telefone: "",
          fotoURL: ""
        })

        navigate('/feed')
      } else {
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

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider()
    await signInWithRedirect(auth, provider)
  }

  const styles = {
    page: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "100vh",
      backgroundColor: "white", // cor principal da sidebar
      position: "relative"
    },
    overlay: {
      content: "''",
      position: "absolute",
      inset: 0,
      background: "rgba(0,0,0,0.3)", // overlay suave
      backdropFilter: "blur(2px)"
    },
    card: {
      position: "relative",
      background: "white",
      padding: "32px 24px",
      borderRadius: "20px",
      width: "100%",
      maxWidth: "380px",
      boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
      textAlign: "center",
      zIndex: 1
    },
    logo: {
      width: "80px",
      height: "80px",
      borderRadius: "50%",
      margin: "0 auto 20px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
      border: "2px solid #E53E3E" // contorno da logo na cor da sidebar
    },
    logoImg: {
      width: "100%",
      height: "100%",
      objectFit: "cover"
    },
    title: {
      fontSize: "1.5rem",
      marginBottom: "20px",
      fontWeight: "700",
      color: "#1f2937"
    },
    input: {
      width: "100%",
      padding: "12px 14px",
      marginBottom: "16px",
      border: "1.5px solid #ccc",
      borderRadius: "12px",
      fontSize: "1rem",
      outline: "none"
    },
    btn: {
      width: "100%",
      padding: "12px",
      border: "none",
      borderRadius: "12px",
      backgroundColor: "#E53E3E", // botão vermelho
      color: "white",
      fontWeight: "600",
      cursor: "pointer",
      marginBottom: "12px"
    },
    or: {
      margin: "10px 0",
      fontSize: "0.9rem",
      fontWeight: "600",
      color: "#6b7280"
    },
    google: {
      width: "100%",
      padding: "12px",
      border: "1.5px solid #ddd",
      borderRadius: "12px",
      backgroundColor: "white",
      color: "#374151",
      fontWeight: "600",
      cursor: "pointer",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      gap: "8px",
      marginBottom: "10px"
    },
    linkBtn: {
      background: "none",
      border: "none",
      color: "#E53E3E", // links na cor da sidebar
      fontWeight: "600",
      cursor: "pointer",
      margin: "4px 8px"
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.overlay}></div>
      <div style={styles.card}>
        <div style={styles.logo}>
          <img src={LogoImg} alt="Logo Dikebra" style={styles.logoImg} />
        </div>

        <h2 style={styles.title}>{isCadastro ? 'Criar Conta' : 'Entrar'}</h2>

        <form onSubmit={enviar}>
          <input type="email" placeholder="Email" style={styles.input} value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input type="password" placeholder="Senha" style={styles.input} value={senha} onChange={(e) => setSenha(e.target.value)} required />

          {isCadastro && (
            <>
              <input type="text" placeholder="Nome Completo" style={styles.input} value={nome} onChange={(e) => setNome(e.target.value)} required />
              <input type="text" placeholder="CPF" style={styles.input} value={cpf} onChange={(e) => setCpf(e.target.value)} required />
              <input type="date" style={styles.input} value={dataNascimento} onChange={(e) => setDataNascimento(e.target.value)} required />
            </>
          )}

          {erro && <small style={{ color: "red" }}>{erro}</small>}
          {sucesso && <small style={{ color: "green" }}>{sucesso}</small>}

          <button type="submit" style={styles.btn}>{isCadastro ? 'Cadastrar' : 'Entrar'}</button>
        </form>

        <div style={styles.or}>OU</div>

        <button style={styles.google} onClick={handleGoogleLogin}>
          <FcGoogle size={20} />
          Entrar com o Google
        </button>

        <div style={{ marginTop: "16px" }}>
          <button type="button" style={styles.linkBtn} onClick={() => setIsCadastro(!isCadastro)}>
            {isCadastro ? 'Já tenho conta' : 'Quero me cadastrar'}
          </button>

          {!isCadastro && (
            <button type="button" style={styles.linkBtn} onClick={handleEsqueciSenha}>
              Esqueci minha senha
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
