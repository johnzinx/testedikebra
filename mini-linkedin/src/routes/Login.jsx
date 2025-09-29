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
import LogoImg from '../img/logodkebra.jpg'

export default function Login() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [nome, setNome] = useState('')
  const [cpf, setCpf] = useState('')
  const [dataNascimento, setDataNascimento] = useState('')
  const [tipoUsuario, setTipoUsuario] = useState('pcd')
  const [deficiencia, setDeficiencia] = useState('')
  const [tipoDeficiencia, setTipoDeficiencia] = useState('')
  const [cnpj, setCnpj] = useState('')
  const [razaoSocial, setRazaoSocial] = useState('')

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

        const dadosUsuario = {
          email,
          nome, // nome da pess=oa ou da empresa
          tipoUsuario,
          fotoURL: "",
          telefone: "",
        }

        if (tipoUsuario === 'pcd') {
          dadosUsuario.cpf = cpf
          dadosUsuario.dataNascimento = dataNascimento
          dadosUsuario.deficiencia = deficiencia
          dadosUsuario.tipoDeficiencia = tipoDeficiencia
        } else if (tipoUsuario === 'empresa') {
          dadosUsuario.cnpj = cnpj
          dadosUsuario.razaoSocial = razaoSocial
        }

        await setDoc(doc(db, "users", uid), dadosUsuario)
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
      backgroundColor: "white",
      position: "relative"
    },
    overlay: {
      content: "''",
      position: "absolute",
      inset: 0,
      background: "rgba(0,0,0,0.3)",
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
      border: "2px solid #E53E3E"
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
      backgroundColor: "#E53E3E",
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
      color: "#E53E3E",
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

              <label style={{ display: "block", textAlign: "left", marginBottom: "8px", fontWeight: "600" }}>
                Tipo de Conta:
              </label>
              <div style={{ display: "flex", justifyContent: "space-around", marginBottom: "16px" }}>
                <label>
                  <input type="radio" name="tipoUsuario" value="pcd" checked={tipoUsuario === 'pcd'} onChange={() => setTipoUsuario('pcd')} /> PCD
                </label>
                <label>
                  <input type="radio" name="tipoUsuario" value="empresa" checked={tipoUsuario === 'empresa'} onChange={() => setTipoUsuario('empresa')} /> Empresa
                </label>
              </div>

              {tipoUsuario === 'pcd' && (
                <>
                  <input type="text" placeholder="CPF" style={styles.input} value={cpf} onChange={(e) => setCpf(e.target.value)} required />
                  <input type="date" style={styles.input} value={dataNascimento} onChange={(e) => setDataNascimento(e.target.value)} required />

                  <select style={styles.input} value={deficiencia} onChange={(e) => { setDeficiencia(e.target.value); setTipoDeficiencia('') }} required>
                    <option value="">Selecione sua deficiência</option>
                    <option value="visual">Visual</option>
                    <option value="auditiva">Auditiva</option>
                    <option value="fisica">Física</option>
                    <option value="intelectual">Intelectual</option>
                    <option value="multipla">Múltipla</option>
                    <option value="outra">Outra</option>
                  </select>

                  {deficiencia && (
                    <select style={styles.input} value={tipoDeficiencia} onChange={(e) => setTipoDeficiencia(e.target.value)} required>
                      <option value="">Selecione o tipo específico</option>
                      {deficiencia === "visual" && <>
                        <option value="baixa-visao">Baixa visão</option>
                        <option value="cegueira-total">Cegueira total</option>
                      </>}
                      {deficiencia === "auditiva" && <>
                        <option value="surdez-parcial">Surdez parcial</option>
                        <option value="surdez-total">Surdez total</option>
                      </>}
                      {deficiencia === "fisica" && <>
                        <option value="cadeirante">Cadeirante</option>
                        <option value="amputacao">Amputação</option>
                        <option value="mobilidade-reduzida">Mobilidade reduzida</option>
                      </>}
                      {deficiencia === "intelectual" && <>
                        <option value="autismo">Autismo</option>
                        <option value="sindrome-down">Síndrome de Down</option>
                        <option value="deficiencia-intelectual">Deficiência Intelectual</option>
                      </>}
                      {deficiencia === "multipla" && <>
                        <option value="visual-fisica">Visual + Física</option>
                        <option value="auditiva-fisica">Auditiva + Física</option>
                        <option value="outras-combinacoes">Outras combinações</option>
                      </>}
                      {deficiencia === "outra" && <>
                        <option value="nao-listada">Não listada</option>
                      </>}
                    </select>
                  )}
                </>
              )}

              {tipoUsuario === 'empresa' && (
                <>
                  <input type="text" placeholder="CNPJ" style={styles.input} value={cnpj} onChange={(e) => setCnpj(e.target.value)} required />
                  <input type="text" placeholder="Razão Social" style={styles.input} value={razaoSocial} onChange={(e) => setRazaoSocial(e.target.value)} required />
                </>
              )}
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