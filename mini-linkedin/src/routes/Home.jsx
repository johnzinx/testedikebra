import React, { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { FiLogIn, FiEye } from "react-icons/fi"
import Logo from "../img/logodkebra.jpg" // caminho da sua logo

export default function Home() {
  const BREAKPOINT = 768
  const [width, setWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1024
  )

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth)
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const isDesktop = width >= BREAKPOINT
  const PRIMARY = "#E53E3E"

  const leftFlex = isDesktop ? 0.4 : 0.3
  const rightFlex = 1 - leftFlex

  const styles = {
    container: {
      display: "flex",
      flexDirection: isDesktop ? "row" : "column",
      minHeight: "100vh",
      width: "100%",
      backgroundColor: "white",
    },
    left: {
      flex: leftFlex,
      position: "relative",
    },
    logo: {
      width: "100%",
      height: "100%",
      objectFit: "cover", // cobre toda a coluna
    },
    right: {
      flex: rightFlex,
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: isDesktop ? "flex-start" : "center",
      padding: isDesktop ? "3rem" : "2rem",
      textAlign: isDesktop ? "left" : "center",
    },
    title: {
      fontSize: isDesktop ? "2.5rem" : "2rem",
      fontWeight: "bold",
      color: "#111",
      margin: 0,
    },
    subtitle: {
      fontSize: "1.1rem",
      color: "#555",
      marginTop: "1rem",
      marginBottom: "2rem",
      maxWidth: "400px",
      lineHeight: 1.5,
    },
    buttons: {
      display: "flex",
      flexDirection: isDesktop ? "row" : "column",
      gap: "1rem",
      width: isDesktop ? "auto" : "100%",
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
      textAlign: isDesktop ? "left" : "center",
    },
  }

  return (
    <div style={styles.container}>
      {/* Coluna da esquerda ocupando toda a altura com imagem */}
      <div style={styles.left}>
        <img src={Logo} alt="Logo Dikebra" style={styles.logo} />
      </div>

      {/* Coluna da direita com CTA */}
      <div style={styles.right}>
        <h1 style={styles.title}>Bem-vindo ao Dikebra</h1>
        <p style={styles.subtitle}>
          Conecte-se, compartilhe experiências e descubra novas oportunidades.
          Tudo em uma só rede feita para você.
        </p>

        <div style={styles.buttons}>
          <Link
            to="/login"
            style={{ ...styles.baseButton, ...styles.login }}
          >
            <FiLogIn size={18} /> Entrar
          </Link>
          <Link
            to="/perfil/demo"
            style={{ ...styles.baseButton, ...styles.explore }}
          >
            <FiEye size={18} /> Explorar
          </Link>
        </div>

        <p style={styles.smallText}>
          Já tem uma conta? Faça login e aproveite tudo.
        </p>
      </div>
    </div>
  )
}
