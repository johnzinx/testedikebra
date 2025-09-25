import React from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const PRIMARY = "#E53E3E";
  const SECONDARY = "#3182CE";
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
      backgroundColor: "white",
      textAlign: "center",
    },
    title: {
      fontSize: isDesktop ? "3rem" : "2.2rem",
      fontWeight: "bold",
      color: "#111",
      marginBottom: "1rem",
    },
    subtitle: {
      fontSize: "1.1rem",
      color: "#555",
      marginBottom: "2rem",
      maxWidth: "500px",
      lineHeight: 1.5,
    },
    buttons: {
      display: "flex",
      flexDirection: isDesktop ? "row" : "column",
      gap: "1rem",
      width: isDesktop ? "auto" : "100%",
      justifyContent: "center",
    },
    baseButton: {
      padding: "12px 18px",
      borderRadius: "9999px",
      fontWeight: 600,
      fontSize: "1rem",
      textDecoration: "none",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "0.5rem",
      cursor: "pointer",
      transition: "all 0.2s ease",
      border: "none",
      color: "white",
    },
    criar: {
      backgroundColor: PRIMARY,
    },
    login: {
      backgroundColor: SECONDARY,
    },
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Bem-vindo(a) ao Dikebra</h1>
      <p style={styles.subtitle}>Oportunidades ao seu alcance</p>

      <div style={styles.buttons}>
        <button
          style={{ ...styles.baseButton, ...styles.criar }}
          onClick={() => navigate("/login?cadastro=true")}
        >
          Criar Conta
        </button>

        <button
          style={{ ...styles.baseButton, ...styles.login }}
          onClick={() => navigate("/login")}
        >
          Já tenho conta
        </button>
      </div>
    </div>
  );
}
