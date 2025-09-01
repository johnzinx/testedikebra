import { useEffect, useState } from 'react'
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, signInAnonymously, onAuthStateChanged, signInWithCustomToken } from 'firebase/auth';

// Componente para o carrossel de imagens
const JobCarousel = () => {
  // URLs de imagens de alta qualidade relacionadas a empregos
  const images = [
    'https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=1974&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=2070&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1552581234-26160f608093?q=80&w=2070&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1573496359142-b8d87734b0a4?q=80&w=2070&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1518644755106-e7e01a1c4b78?q=80&w=2070&auto=format&fit=crop', // Imagem que substitui "Vagas Disponíveis"
    'https://images.unsplash.com/photo-1542838686-373286f7800b?q=80&w=2070&auto=format&fit=crop', // Imagem que substitui "Crescimento na Empresa"
  ];
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    // Alterna a imagem a cada 4 segundos
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div style={carouselStyles.carouselContainer}>
      {images.map((image, index) => (
        <div
          key={index}
          style={{
            ...carouselStyles.carouselImage,
            backgroundImage: `url(${image})`,
            opacity: index === currentImageIndex ? 1 : 0,
          }}
        />
      ))}
    </div>
  );
};

export default function Login() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [nome, setNome] = useState('')
  const [cpf, setCpf] = useState('')
  const [dataNascimento, setDataNascimento] = useState('')
  const [isCadastro, setIsCadastro] = useState(false)
  const [erro, setErro] = useState(null)
  const [sucesso, setSucesso] = useState(null)
  const [auth, setAuth] = useState(null)
  const [page, setPage] = useState('login')

  useEffect(() => {
    try {
      const firebaseConfig = JSON.parse(typeof __firebase_config !== 'undefined' ? __firebase_config : '{}');
      const app = initializeApp(firebaseConfig);
      const authInstance = getAuth(app);
      setAuth(authInstance);

      const handleAuthStateChange = (user) => {
        if (user) {
          console.log("Utilizador autenticado:", user.uid);
          setPage('feed');
        } else {
          console.log("Nenhum utilizador autenticado.");
          setPage('login');
        }
      };

      const unsubscribe = onAuthStateChanged(authInstance, handleAuthStateChange);
      
      const authenticateUser = async () => {
        if (typeof __initial_auth_token !== 'undefined') {
          await signInWithCustomToken(authInstance, __initial_auth_token);
        } else {
          await signInAnonymously(authInstance);
        }
      };

      authenticateUser();

      return () => unsubscribe();
    } catch (e) {
      console.error("Erro na inicialização do Firebase:", e);
      setErro("Falha na inicialização do serviço. Tente novamente mais tarde.");
    }
  }, []);

  const enviar = async (e) => {
    e.preventDefault()
    if (!auth) {
      setErro('O serviço de autenticação não está disponível. Tente novamente mais tarde.');
      return;
    }
    try {
      if (isCadastro) {
        await createUserWithEmailAndPassword(auth, email, senha)
        setPage('feed')
      } else {
        await signInWithEmailAndPassword(auth, email, senha)
        setPage('feed')
      }
    } catch (err) {
      setErro(err.message)
    }
  }

  const handleEsqueciSenha = async () => {
    if (!auth) {
      setErro('O serviço de autenticação não está disponível. Tente novamente mais tarde.');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email)
      setSucesso('E-mail de redefinição de senha enviado com sucesso!')
    } catch (err) {
      setErro('Não foi possível enviar o e-mail de redefinição de senha.')
    }
  }

  const renderLoginPage = () => (
    <>
      <div style={styles.card}>
        <div style={styles.logo}>
          <img src="https://web.whatsapp.com/31ce2586-6cc1-4d2a-9b06-dc442487f9fc.jpg" alt="Logo D'Kebra" style={styles.logoImage} />
        </div>
        <h2 style={styles.title}>{isCadastro ? 'Criar Conta' : 'Entrar'}</h2>

        <form onSubmit={enviar}>
          <input
            type="email"
            placeholder="Email"
            style={styles.input}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Senha"
            style={styles.input}
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
          />

          {isCadastro && (
            <>
              <input
                type="text"
                placeholder="Nome Completo"
                style={styles.input}
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
              />

              <input
                type="text"
                placeholder="CPF"
                style={styles.input}
                value={cpf}
                onChange={(e) => setCpf(e.target.value)}
                required
              />

              <input
                type="date"
                style={styles.input}
                value={dataNascimento}
                onChange={(e) => setDataNascimento(e.target.value)}
                required
              />
            </>
          )}

          {erro && <small style={{ color: "red" }}>{erro}</small>}
          {sucesso && <small style={{ color: "green" }}>{sucesso}</small>}

          <button type="submit" style={styles.btn}>
            {isCadastro ? 'Cadastrar' : 'Entrar'}
          </button>
        </form>

        <div style={styles.or}>OU</div>

        <button style={styles.socialBtn}>
          {/* Ícone do Google em SVG */}
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M21.144 10.999a.885.885 0 0 0-.007-.123c-.114-.645-.262-1.398-.262-2.189-.001-.274.015-.547.051-.817h-8.239v3.869h4.522c-.18.784-.632 1.488-1.296 2.052l.01.008-2.671 2.672-.001.002a7.319 7.319 0 0 0 2.378 1.954l.006.002 2.766 2.768.035.02a11.97 11.97 0 0 1-6.198 1.76c-3.131 0-5.918-1.353-7.886-3.504-1.968-2.15-3.033-5.071-3.033-8.311s1.065-6.161 3.033-8.311c1.968-2.15 4.755-3.504 7.886-3.504 1.701 0 3.321.579 4.619 1.621l-.001.002 2.673-2.673.001-.002a12.015 12.015 0 0 1-4.793-1.071c-.004-.002-.008-.004-.012-.006a12.185 12.185 0 0 0-7.794-.968c-6.602 0-11.983 5.38-11.983 11.983s5.381 11.983 11.983 11.983c5.319 0 9.873-3.483 11.536-8.311a.895.895 0 0 0 .195-.36z"/></svg>
          Entrar com o Google
        </button>

        <button style={styles.socialBtn}>
          {/* Ícone da Microsoft em SVG */}
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M11.66 11.66h-5.99v-5.99h5.99v5.99zm-5.99 1.34h5.99v5.99h-5.99v-5.99zm7.34 0h5.99v5.99h-5.99v-5.99zm0-1.34h5.99v-5.99h-5.99v5.99z"/></svg>
          Entrar com a Microsoft
        </button>

        <button style={styles.socialBtn}>
          {/* Ícone da Apple em SVG */}
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12.1 2.3c-.6 0-1.2.1-1.8.3C10.3 1.1 8.9 0 7.3 0c-1.9 0-3.5 1.5-3.5 3.5 0 .9.4 1.7 1 2.3-.5.4-1 .8-1.5 1.3C.9 9.3 0 11.2 0 13.5c0 2.2.9 4.2 2.5 5.6C4.1 20.5 6 21 8.4 21c.5 0 .9 0 1.4-.1.9.4 1.9.7 3 .7 1.1 0 2.1-.2 3.1-.7.4.4.9.8 1.4 1.1 1.7 1.7 4.1 1.7 5.8 0 1.6-1.6 1.6-4.1 0-5.8-.5-.5-1-.9-1.5-1.3.6-.6 1-1.4 1-2.3 0-1.9-1.6-3.5-3.5-3.5-1.6 0-3 1.1-3.6 2.5-.6-.2-1.2-.3-1.8-.3zM12.1 4c.6 0 1.1.1 1.6.2-.5.5-.8 1.2-.8 2-.1.9.3 1.7 1 2.3-.6-.2-1.2-.3-1.8-.3-1.6 0-2.9 1.3-2.9 2.9s1.3 2.9 2.9 2.9c1.6 0 2.9-1.3 2.9-2.9 0-.8-.3-1.5-.8-2s-.8-.5-1.4-.5c-1.1 0-2 .9-2 2s.9 2 2 2c.5 0 .9-.1 1.2-.4-.3.4-.5.9-.5 1.4 0 1.1 1.1 2 2.2 2 .5 0 1-.2 1.4-.5.4.3.8.5 1.2.5 1.1 0 2-.9 2-2 0-.6-.3-1.1-.7-1.5z"/></svg>
          Entrar com Apple
        </button>

        <div style={{ marginTop: "16px" }}>
          <button
            type="button"
            style={styles.linkBtn}
            onClick={() => setIsCadastro(!isCadastro)}
          >
            {isCadastro ? 'Já tenho conta' : 'Quero me cadastrar'}
          </button>

          {!isCadastro && (
            <button
              type="button"
              style={styles.linkBtn}
              onClick={handleEsqueciSenha}
            >
              Esqueci minha senha
            </button>
          )}
        </div>
      </div>
    </>
  );

  const renderFeedPage = () => (
    <div style={styles.card}>
      <h2 style={styles.title}>Bem-vindo!</h2>
      <p>O seu login foi efetuado com sucesso.</p>
    </div>
  );

  return (
    <div style={styles.page}>
      {/* Carrossel de imagens como fundo */}
      <JobCarousel />
      <div style={styles.overlay}></div>
      {page === 'login' ? renderLoginPage() : renderFeedPage()}
    </div>
  )
}
// ============== ESTILOS ==============
const styles = {
  page: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    position: "relative",
    overflow: 'hidden', 
  },
  overlay: {
    content: "''",
    position: "absolute",
    inset: 0,
    background: "rgba(0,0,0,0.45)",
    backdropFilter: "blur(3px)",
    zIndex: 1,
  },
  card: {
    position: "relative",
    background: "rgba(255,255,255,0.95)",
    padding: "32px 24px",
    borderRadius: "20px",
    width: "100%",
    maxWidth: "380px",
    boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
    textAlign: "center",
    zIndex: 2, 
  },
  logo: {
    width: "80px",
    height: "80px",
    borderRadius: "50%",
    background: "#d97706",
    margin: "0 auto 20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "bold",
    color: "white",
    overflow: 'hidden', // Esconde qualquer parte da imagem que exceda o tamanho
  },
  logoImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover", // Garante que a imagem preencha o contêiner sem distorção
  },
  title: {
    fontSize: "1.5rem",
    marginBottom: "20px",
    fontWeight: "700",
    color: "#1f2937",
  },
  input: {
    width: "100%",
    padding: "12px 14px",
    marginBottom: "16px",
    border: "1.5px solid #ccc",
    borderRadius: "12px",
    fontSize: "1rem",
    outline: "none",
  },
  btn: {
    width: "100%",
    padding: "12px",
    border: "none",
    borderRadius: "12px",
    backgroundColor: "#2563eb",
    color: "white",
    fontWeight: "600",
    cursor: "pointer",
    marginBottom: "12px",
  },
  or: {
    margin: "10px 0",
    fontSize: "0.9rem",
    fontWeight: "600",
    color: "#6b7280",
  },
  socialBtn: {
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
    marginBottom: "12px",
  },
  linkBtn: {
    background: "none",
    border: "none",
    color: "#2563eb",
    fontWeight: "600",
    cursor: "pointer",
    margin: "4px 8px",
  }
};

// Estilos específicos para o carrossel
const carouselStyles = {
  carouselContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
  },
  carouselImage: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundSize: "cover",
    backgroundPosition: "center",
    transition: "opacity 1.5s ease-in-out",
  },
};
