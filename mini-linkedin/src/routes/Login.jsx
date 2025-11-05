import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithRedirect
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';
import { FaGoogle } from "react-icons/fa";
import LogoImg from '../img/novalogo.jpg';

// nossa paleta 
const FONT_COLOR_DARK = "#1A1A1A";
const ACCENT_COLOR = "#CF0908";
const PRIMARY = "#FFFFFF";
const BACKGROUND_COLOR = "#1A1A1A";
const BORDER_COLOR = "#E0E0E0";
const SUCCESS_COLOR = "green";
const ERROR_COLOR = "#D32F2F";

const HOVER_SHADOW = "0 6px 20px rgba(0, 0, 0, 0.3)";
const RED_HOVER_SHADOW = `0 8px 25px ${ACCENT_COLOR}70`;

const ButtonWithHover = ({ style, onClick, children, type = "button" }) => {
  const [isHovered, setIsHovered] = useState(false);

  const shadow = style.backgroundColor === ACCENT_COLOR ? RED_HOVER_SHADOW : HOVER_SHADOW;

  const hoverStyle = {
    transform: "translateY(-2px)",
    boxShadow: shadow
  };

  const baseStyle = {
    transition: "all 0.3s ease-in-out",
    cursor: "pointer",
    ...style
  };

  return (
    <button
      type={type}
      style={{
        ...baseStyle,
        ...(isHovered ? hoverStyle : {})
      }}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
    </button>
  );
};



export default function Login() {
  const location = useLocation();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [tipoUsuario, setTipoUsuario] = useState('pcd');
  const [deficiencia, setDeficiencia] = useState('');
  const [tipoDeficiencia, setTipoDeficiencia] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [razaoSocial, setRazaoSocial] = useState('');

  const [isCadastro, setIsCadastro] = useState(false);
  const [erro, setErro] = useState(null);
  const [sucesso, setSucesso] = useState(null);


  const [focusedInput, setFocusedInput] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('cadastro') === 'true') {
      setIsCadastro(true);
    }
  }, [location.search]);

  const enviar = async (e) => {
    e.preventDefault();
    setErro(null);
    setSucesso(null);

    try {
      if (isCadastro) {
        // valida o usuario individual
        if (tipoUsuario === 'Usuário Individual' && (!cpf || !dataNascimento)) {
          setErro("CPF e Data de Nascimento são obrigatórios para Usuário Individual.");
          return;
        }

        const cred = await createUserWithEmailAndPassword(auth, email, senha);
        const uid = cred.user.uid;

        const dadosUsuario = {
          email, nome, tipoUsuario, fotoURL: "", telefone: "",
        };

        if (tipoUsuario === 'pcd') {
          dadosUsuario.cpf = cpf; dadosUsuario.dataNascimento = dataNascimento;
          // pcd: deficiencia, tipo deficiencia
          dadosUsuario.deficiencia = deficiencia; dadosUsuario.tipoDeficiencia = tipoDeficiencia;
          // empresa: cnpj, razao social
        } else if (tipoUsuario === 'empresa') {
          dadosUsuario.cnpj = cnpj; dadosUsuario.razaoSocial = razaoSocial;
        } else if (tipoUsuario === 'Usuário Individual') {
          // usuario indivudal: CPF e Data de Nascimento
          dadosUsuario.cpf = cpf; dadosUsuario.dataNascimento = dataNascimento;

        }

        await setDoc(doc(db, "users", uid), dadosUsuario);
        navigate('/feed');
      } else {
        await signInWithEmailAndPassword(auth, email, senha);
        navigate('/feed');
      }
    } catch (err) {
      setErro(err.message.includes("auth/email-already-in-use") ? "Este e-mail já está cadastrado." : err.message);
    }
  };

  const handleEsqueciSenha = async () => {
    try {
      if (!email) {
        setErro('Por favor, digite seu email para redefinir a senha.');
        return;
      }
      await sendPasswordResetEmail(auth, email);
      setSucesso('E-mail de redefinição de senha enviado com sucesso!');
      setErro(null);
    } catch (err) {
      setErro('Não foi possível enviar o e-mail de redefinição. Verifique o email digitado.');
      setSucesso(null);
    }
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithRedirect(auth, provider);
  };

  // estilos
  // estilo do botao base
  const baseButton = {
    padding: "14px 20px",
    borderRadius: "10px",
    fontWeight: 700,
    fontSize: "1rem",
    gap: "0.75rem",
    border: "none",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.4)",
    width: "100%",
    maxWidth: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  const styles = {
    page: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "100vh",
      backgroundColor: BACKGROUND_COLOR,
      backgroundImage: `radial-gradient(circle at center, #2d2d2d 0%, ${BACKGROUND_COLOR} 100%)`,
      position: "relative",
      padding: "20px",
      boxSizing: "border-box",
    },
    card: {
      position: "relative",
      background: PRIMARY,
      padding: "32px 28px",
      borderRadius: "16px",
      width: "100%",
      maxWidth: "400px",
      boxShadow: "0 12px 30px rgba(0,0,0,0.7)",
      textAlign: "center",
      zIndex: 1,
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
      border: `2px solid ${ACCENT_COLOR}`,
    },
    logoImg: {
      width: "100%",
      height: "100%",
      objectFit: "cover"
    },
    logoCorner: {
      position: "absolute",
      top: "20px",
      right: "20px",
      width: "60px",
      height: "auto",
      zIndex: 0,
      opacity: 0.2,
      borderRadius: "50%",
    },
    title: {
      fontSize: "1.8rem",
      marginBottom: "24px",
      fontWeight: "800",
      color: FONT_COLOR_DARK
    },
    // estilo dso input
    baseInput: {
      width: "100%",
      padding: "14px 16px",
      marginBottom: "16px",
      borderRadius: "8px",
      fontSize: "1rem",
      outline: "none",
      color: FONT_COLOR_DARK,
      backgroundColor: "#FAFAFA",
      transition: "all 0.3s ease",
    },
    // Eestilo de input dinamico
    dynamicInput: (fieldName) => ({
      ...styles.baseInput,
      border: `1px solid ${focusedInput === fieldName ? ACCENT_COLOR : BORDER_COLOR}`,
      boxShadow: focusedInput === fieldName ? `0 0 0 2px ${ACCENT_COLOR}30` : 'none',
    }),

    btnPrimary: {
      ...baseButton,
      backgroundColor: ACCENT_COLOR,
      color: PRIMARY,
      margin: "24px auto 16px",
    },
    btnGoogle: {
      ...baseButton,
      backgroundColor: PRIMARY,
      color: FONT_COLOR_DARK,
      border: `1px solid ${BORDER_COLOR}`,
      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
    },
    or: {
      margin: "15px 0",
      fontSize: "0.95rem",
      fontWeight: "600",
      color: BORDER_COLOR
    },
    linkBtn: {
      background: "none",
      border: "none",
      color: ACCENT_COLOR,
      fontWeight: "700",
      cursor: "pointer",
      margin: "4px 8px",
      fontSize: "0.95rem",
      transition: "opacity 0.2s",
      textDecoration: "underline" 
    },
    radioLabelStyle: {
      fontWeight: 500,
      color: FONT_COLOR_DARK,
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      marginRight: '12px',
    },
    // estilo pro select
    selectStyle: (isFocused) => ({
      ...styles.baseInput,
      border: `1px solid ${isFocused ? ACCENT_COLOR : BORDER_COLOR}`,
      appearance: "none",
      backgroundImage: "url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%231A1A1A%22%20d%3D%22M287%20177.3l-131-131c-4.2-4.2-11-4.2-15.2%200L5.4%20177.3c-7.3%207.3-2%2020%208%2020h257.6c10%200%2015.3-12.7%208-20z%22%2F%3E%3C%2Fsvg%3E')",
      backgroundRepeat: "no-repeat",
      backgroundPosition: "right 14px center",
      backgroundSize: "0.6em",
      paddingRight: "35px",
    })
  };

  // cria as prop dos input
  const getInputProps = (name, value, setter, type = "text", required = true) => ({
    type,
    placeholder: name.charAt(0).toUpperCase() + name.slice(1).replace(/([A-Z])/g, ' $1'),
    style: styles.dynamicInput(name),
    value,
    onChange: (e) => setter(e.target.value),
    onFocus: () => setFocusedInput(name),
    onBlur: () => setFocusedInput(null),
    required
  });


  return (
    <div style={styles.page}>
      <img src={LogoImg} alt="Logo Dikebra Fundo" style={styles.logoCorner} />
      <div style={styles.card}>
        <div style={styles.logo}>
          <img src={LogoImg} alt="Logo Dikebra" style={styles.logoImg} />
        </div>
        <h2 style={styles.title}>{isCadastro ? 'Crie sua Conta' : 'Acesse sua Conta'}</h2>

        <form onSubmit={enviar}>
          {/* Email */}
          <input
            type="email"
            placeholder="Email"
            required
            {...getInputProps("email", email, setEmail, "email")}
          />
          {/* Senha */}
          <input
            type="password"
            placeholder="Senha"
            required
            {...getInputProps("senha", senha, setSenha, "password")}
          />

          {isCadastro && (
            <>
              {/* Nome */}
              <input type="text" placeholder="Nome Completo" required {...getInputProps("nome", nome, setNome)} />

              {/* tipos de conta */}
              <div style={{ ...styles.formSection, textAlign: "left" }}>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: FONT_COLOR_DARK }}>
                  Tipo de Conta:
                </label>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px", flexWrap: "wrap", gap: "8px" }}>
                  <label style={styles.radioLabelStyle}>
                    <input type="radio" name="tipoUsuario" value="pcd" checked={tipoUsuario === 'pcd'} onChange={() => setTipoUsuario('pcd')} /> Candidato PCD
                  </label>
                  <label style={styles.radioLabelStyle}>
                    <input type="radio" name="tipoUsuario" value="empresa" checked={tipoUsuario === 'empresa'} onChange={() => setTipoUsuario('empresa')} /> Empresa
                  </label>
                  <label style={styles.radioLabelStyle}>
                    <input type="radio" name="tipoUsuario" value="Usuário Individual" checked={tipoUsuario === 'Usuário Individual'} onChange={() => setTipoUsuario('Usuário Individual')} /> Usuário Individual
                  </label>
                </div>
              </div>

              {/* pcd */}
              {tipoUsuario === 'pcd' && (
                <>
                  <input type="text" placeholder="CPF" required {...getInputProps("cpf", cpf, setCpf)} />
                  
                  <input type="date" placeholder="Data de Nascimento" required {...getInputProps("dataNascimentoPCD", dataNascimento, setDataNascimento, "date")} />
                  {/* selecionar deficiencia */}
                  <select
                    style={styles.selectStyle(focusedInput === "deficiencia")}
                    value={deficiencia}
                    onChange={(e) => { setDeficiencia(e.target.value); setTipoDeficiencia('') }}
                    onFocus={() => setFocusedInput("deficiencia")}
                    onBlur={() => setFocusedInput(null)}
                    required
                  >
                    <option value="">Selecione sua deficiência</option>
                    <option value="visual">Visual</option>
                    <option value="auditiva">Auditiva</option>
                    <option value="fisica">Física</option>
                    <option value="intelectual">Intelectual</option>
                    <option value="multipla">Múltipla</option>
                    <option value="outra">Outra</option>
                  </select>
                  {/* selecionar tipo */}
                  {deficiencia && (
                    <select
                      style={styles.selectStyle(focusedInput === "tipoDeficiencia")}
                      value={tipoDeficiencia}
                      onChange={(e) => setTipoDeficiencia(e.target.value)}
                      onFocus={() => setFocusedInput("tipoDeficiencia")}
                      onBlur={() => setFocusedInput(null)}
                      required
                    >
                      <option value="">Selecione o tipo específico</option>
                      {deficiencia === "visual" && (<><option value="baixa-visao">Baixa visão</option><option value="cegueira-total">Cegueira total</option></>)}
                      {deficiencia === "auditiva" && (<><option value="surdez-parcial">Surdez parcial</option><option value="surdez-total">Surdez total</option></>)}
                      {deficiencia === "fisica" && (<><option value="cadeirante">Cadeirante</option><option value="amputacao">Amputação</option><option value="mobilidade-reduzida">Mobilidade reduzida</option></>)}
                      {deficiencia === "intelectual" && (<><option value="autismo">Autismo</option><option value="sindrome-down">Síndrome de Down</option><option value="deficiencia-intelectual">Deficiência Intelectual</option></>)}
                      {deficiencia === "multipla" && (<><option value="visual-fisica">Visual + Física</option><option value="auditiva-fisica">Auditiva + Física</option><option value="outras-combinacoes">Outras combinações</option></>)}
                      {deficiencia === "outra" && (<><option value="nao-listada">Não listada</option></>)}
                    </select>
                  )}
                </>
              )}

              {/* empresa */}
              {tipoUsuario === 'empresa' && (
                <>
                  <input type="text" placeholder="CNPJ" required {...getInputProps("cnpj", cnpj, setCnpj)} />
                  <input type="text" placeholder="Razão Social" required {...getInputProps("razaoSocial", razaoSocial, setRazaoSocial)} />
                </>
              )}

              {/* individual */}
              {tipoUsuario === 'Usuário Individual' && (
                <>
                  <input type="text" placeholder="CPF" required {...getInputProps("cpf", cpf, setCpf)} />
                  {/* Mudança no placeholder para data ser mais clara, mesmo sendo tipo date */}
                  <input type="date" placeholder="Data de Nascimento" required {...getInputProps("dataNascimentoIndividual", dataNascimento, setDataNascimento, "date")} />
                </>
              )}
            </>
          )}

          {erro && <small style={{ color: ERROR_COLOR, display: "block", marginBottom: "8px", fontWeight: "600" }}>⚠️ {erro}</small>}
          {sucesso && <small style={{ color: SUCCESS_COLOR, display: "block", marginBottom: "8px", fontWeight: "600" }}>✅ {sucesso}</small>}

          {/* Botão principal com Hover */}
          <ButtonWithHover type="submit" style={styles.btnPrimary}>
            {isCadastro ? 'Cadastrar' : 'Entrar'}
          </ButtonWithHover>
        </form>

        <div style={styles.or}>OU</div>

        {/* botao do google */}
        <ButtonWithHover style={styles.btnGoogle} onClick={handleGoogleLogin}>
          <FaGoogle size={20} color={ACCENT_COLOR} />
          Entrar com o Google
        </ButtonWithHover>

        <div style={{ marginTop: "16px", display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", maxWidth: "100%", margin: "16px auto 0" }}>
          {/* alterna em login/cadastro */}
          <button type="button" style={styles.linkBtn} onClick={() => setIsCadastro(!isCadastro)}>
            {isCadastro ? 'Já tem conta? Faça Login' : 'Não tem conta? Quero me cadastrar'}
          </button>

          {/* esqeuci a senha */}
          {!isCadastro && (
            <button type="button" style={styles.linkBtn} onClick={handleEsqueciSenha}>
              Esqueci minha senha
            </button>
          )}
        </div>
      </div>
    </div>
  );
}