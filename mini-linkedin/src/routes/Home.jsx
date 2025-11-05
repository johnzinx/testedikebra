
import React from "react";
import { useNavigate } from "react-router-dom";
import { FaGoogle } from 'react-icons/fa';
import DikebraLogo from '../img/novalogo.jpg';


export default function Home() {

  // nossa paleta de cores
  const FONT_COLOR = "#F0F0F0";       // Branco 
  const ACCENT_COLOR = "#CF0908";     // Vermelho principal 
  const PRIMARY = ACCENT_COLOR;       //  é o mesmo vermelho
  const SECONDARY = "#F0F0F0";        // Branco suave
  const GOOGLE_COLOR = "#F0F0F0";     // Cor pro botão Google
  const BACKGROUND_COLOR = "#1A1A1A"; // Fundo escuro


  // responsivo

  // breakpoint para mudar de mobile para pc
  const BREAKPOINT = 768;

  // useState mantem a largura atual
  const [width, setWidth] = React.useState(
    typeof window !== "undefined" ? window.innerWidth : 1024
  );

  const navigate = useNavigate();

  // useEffect para ver o tamanho da tela.
  React.useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // verificar se nois ta  em modo desktop
  const isDesktop = width >= BREAKPOINT;

  // estilos

  const styles = {
    container: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "100vh",
      width: "100%",
      padding: isDesktop ? "0 3rem" : "0 2rem",
      backgroundColor: "#1A1A1A",
      textAlign: "center",
      position: "relative",
    },
    title: {
      fontSize: isDesktop ? "3.5rem" : "2.5rem",
      fontWeight: "bold",
      color: ACCENT_COLOR,
      marginBottom: "0.5rem",
      letterSpacing: isDesktop ? "1px" : "0",
    },
    subtitle: {
      fontSize: "1.25rem",
      color: FONT_COLOR,
      marginBottom: isDesktop ? "3rem" : "2.5rem",
      maxWidth: "500px",
      lineHeight: 1.5,
    },
    buttons: {
      display: "flex",
      flexDirection: "column", // botões de baixo do outro
      gap: "1rem",
      width: "100%",
      justifyContent: "center",
      alignItems: "center",
    },

    baseButton: {
      padding: "14px 20px",
      borderRadius: "12px",
      fontWeight: 700,
      fontSize: "1.05rem",
      textDecoration: "none",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "0.75rem", // espaço entre o icon e o texto
      cursor: "pointer",
      transition: "all 0.3s ease-in-out", // animação do hover
      border: "none",
      boxShadow: "0 4px 15px rgba(0, 0, 0, 0.5)",
      width: "100%",
      maxWidth: "320px", // largura max dos botões
    },
    logo: {
      position: "absolute",
      top: "25px",
      right: "25px",
      width: isDesktop ? "90px" : "70px",
      height: "auto",
      borderRadius: "8px",
    }
  };

  // Função placeholder para o login com Google
  const handleGoogleLogin = () => {
    console.log("Tentativa de login com Google");

  };


  const ButtonWithHover = ({ style, onClick, children }) => {
    const [isHovered, setIsHovered] = React.useState(false);


    const hoverStyle = style.backgroundColor === PRIMARY
      ? {
        transform: "translateY(-3px)",

        boxShadow: `0 8px 25px ${ACCENT_COLOR}70`
      }
      : {
        transform: "translateY(-2px)",
        boxShadow: "0 6px 20px rgba(255, 255, 255, 0.2)"
      };

    return (
      <button
        style={{
          ...styles.baseButton,
          ...style,
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



  // vai aparecer na tela:
  return (
    <div style={styles.container}>
      {/* nosso logo la em cima */}
      <img src={DikebraLogo} alt="Logo Dikebra" style={styles.logo} />

      {/* titulos */}
      <h1 style={styles.title}>Bem-vindo(a) ao Dikebra</h1>
      <p style={styles.subtitle}>Oportunidades ao seu alcance</p>

      {/* container dos botões*/}
      <div style={styles.buttons}>

        {/* criar Conta */}
        <ButtonWithHover
          style={{
            backgroundColor: PRIMARY,
            color: "#1A1A1A", // Texto escuro para contrastar com o botão vermelho
          }}
          // vai pra pag de cadastro
          onClick={() => navigate("/login?cadastro=true")}
        >
          Criar Conta
        </ButtonWithHover>

        {/* ja tenho conta */}
        <ButtonWithHover
          style={{
            backgroundColor: SECONDARY,
            color: "#1A1A1A", // Texto escuro
            // [CORREÇÃO] Usamos crases (`) para montar a string com a variável.
            border: `2px solid ${ACCENT_COLOR}` // Borda vermelha de destaque
          }}
          onClick={() => navigate("/login")} // Navega para a página de login
        >
          Já tenho conta
        </ButtonWithHover>

        {/* botao Google */}
        <ButtonWithHover
          style={{
            backgroundColor: GOOGLE_COLOR,
            color: "#1A1A1A" // Texto escuro
          }}
          onClick={handleGoogleLogin}
        >
          {/* fotinha do Google*/}
          <FaGoogle size={20} color={ACCENT_COLOR} />
          Entrar com Google
        </ButtonWithHover>
      </div>
    </div>
  );
}