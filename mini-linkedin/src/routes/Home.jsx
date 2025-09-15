import React from "react"
import { Link } from "react-router-dom"
import { FiLogIn, FiEye } from "react-icons/fi"

export default function Home() {
  const PRIMARY = "#E53E3E"
  const BREAKPOINT = 768
  const [width, setWidth] = React.useState(
    typeof window !== "undefined" ? window.innerWidth : 1024
  )

  React.useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth)
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const isDesktop = width >= BREAKPOINT

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
    },
    login: {
      backgroundColor: PRIMARY,
      color: "white",
    },
    explore: {
      backgroundColor: "transparent",
      border: `2px solid ${PRIMARY}`,
      color: PRIMARY,
    },
    smallText: {
      fontSize: "0.9rem",
      color: "#777",
      marginTop: "1rem",
    },
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Bem-vindo(a) ao Dikebra</h1>
      <p style={styles.subtitle}>
        Oportunidades ao seu alcance
      </p>

      <div style={styles.buttons}>
        <Link to="/login" style={{ ...styles.baseButton, ...styles.login }}>
          <FiLogIn size={18} /> Entrar
        </Link>
        <Link
          to="/perfil/demo"
          style={{ ...styles.baseButton, ...styles.explore }}
        >
          <FiEye size={18} /> Explorar
        </Link>
      </div>

      <p style={styles.smallText}>Já tem uma conta? Faça login e aproveite.</p>
    </div>
  )
}
