import React from "react";
import { useNavigate } from "react-router-dom";
import { FaGoogle } from 'react-icons/fa';
import DikebraLogo from '../img/logodkebra.jpg'; 

export default function Home() {
  // === PALETA DE CORES ATUALIZADA (Mais profissional e com destaque) ===
  const FONT_COLOR = "#F0F0F0";       // Branco Suave para o corpo do texto (Melhor contraste)
  const ACCENT_COLOR = "#CF0908";     // Seu Vermelho para Destaque
  const PRIMARY = ACCENT_COLOR;       // Cor Principal do CTA (Ação)
  const SECONDARY = "#F0F0F0";        // Cor Secundária
  const GOOGLE_COLOR = "#F0F0F0";     // Cor para o botão Google
  const BACKGROUND_COLOR = "#1A1A1A"; // Fundo Dark mais sóbrio
  const HOVER_COLOR = "#FF4D4D";      // Cor para o efeito visual

  const BREAKPOINT = 768;
  const [width, setWidth] = React.useState(
    typeof window !== "undefined" ? window.innerWidth : 1024
  );

  const navigate = useNavigate();

  React.useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isDesktop = width >= BREAKPOINT;

  const styles = {
    container: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "100vh",
      width: "100%",
      padding: isDesktop ? "0 3rem" : "0 2rem",
      backgroundColor: BACKGROUND_COLOR, 
      // Gradiente sutil para dar profundidade (Enfeitado)
      backgroundImage: `radial-gradient(circle at center, #2d2d2d 0%, ${BACKGROUND_COLOR} 100%)`, 
      textAlign: "center",
      position: "relative",
    },
    title: {
      fontSize: isDesktop ? "3.5rem" : "2.5rem", // Título maior
      fontWeight: "bold",
      color: ACCENT_COLOR, // Usa o vermelho para destaque no título
      marginBottom: "0.5rem", 
      letterSpacing: isDesktop ? "1px" : "0", 
    },
    subtitle: {
      fontSize: "1.25rem", // Subtítulo mais evidente
      color: FONT_COLOR, 
      marginBottom: isDesktop ? "3rem" : "2.5rem",
      maxWidth: "500px",
      lineHeight: 1.5,
    },
    buttons: {
      display: "flex",
      flexDirection: "column",
      gap: "1rem",
      width: "100%",
      justifyContent: "center",
      alignItems: "center",
    },
    baseButton: {
      padding: "14px 20px", // Padding ligeiramente maior
      borderRadius: "12px", // Bordas notáveis para visual moderno
      fontWeight: 700, // Texto mais ousado
      fontSize: "1.05rem",
      textDecoration: "none",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "0.75rem",
      cursor: "pointer",
      transition: "all 0.3s ease-in-out", // Transição suave para o hover
      border: "none", 
      boxShadow: "0 4px 15px rgba(0, 0, 0, 0.5)", // Sombra sutil para profundidade (Profissional/Enfeitado)
      width: "100%",
      maxWidth: "320px",
    },
    logo: { 
      position: "absolute",
      top: "25px", // Ligeiramente mais para baixo
      right: "25px", 
      width: isDesktop ? "90px" : "70px", // Logo um pouco maior
      height: "auto",
      borderRadius: "8px", // Borda sutil para a imagem (se for quadrada)
      zIndex: 10, 
    }
  };

  const handleGoogleLogin = () => {
    console.log("Login com Google");
  };

  // NOVO COMPONENTE: Adiciona o efeito de hover
  const ButtonWithHover = ({ style, onClick, children }) => {
    const [isHovered, setIsHovered] = React.useState(false);

    // Efeito de sombra e elevação ao passar o mouse (Visual Enfeitado)
    const hoverStyle = style.backgroundColor === PRIMARY ? 
      { transform: "translateY(-3px)", boxShadow: `0 8px 25px ${ACCENT_COLOR}70` } : 
      { transform: "translateY(-2px)", boxShadow: `0 6px 20px rgba(255, 255, 255, 0.2)` };

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


  return (
    <div style={styles.container}>
      {/* O logo no topo (pode ser o menu ou link para home no futuro) */}
      <img src={DikebraLogo} alt="Logo Dikebra" style={styles.logo} /> 

      <h1 style={styles.title}>Bem-vindo(a) ao Dikebra</h1>
      <p style={styles.subtitle}>Oportunidades ao seu alcance</p>

      <div style={styles.buttons}>
        {/* Botão de MAIOR destaque - Criar Conta */}
        <ButtonWithHover 
          style={{ 
            backgroundColor: PRIMARY, 
            color: "#1A1A1A", // Texto escuro no botão vermelho
          }}
          onClick={() => navigate("/login?cadastro=true")}
        >
          Criar Conta
        </ButtonWithHover>

        {/* Botão Secundário - Já tenho conta */}
        <ButtonWithHover
          style={{ 
            backgroundColor: SECONDARY, 
            color: "#1A1A1A", 
            border: `2px solid ${ACCENT_COLOR}` // Borda de destaque
          }}
          onClick={() => navigate("/login")}
        >
          Já tenho conta
        </ButtonWithHover>
        
        {/* Botão Google - Mantido com o visual modernizado */}
        <ButtonWithHover
          style={{ 
            backgroundColor: GOOGLE_COLOR, 
            color: "#1A1A1A"
          }}
          onClick={handleGoogleLogin}
        >
          <FaGoogle size={20} color={ACCENT_COLOR} /> {/* Ícone colorido de destaque */}
          Entrar com Google
        </ButtonWithHover>
      </div>
    </div>
  );
}