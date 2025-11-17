import { useEffect, useState, useRef } from "react";
import {
  collection,
  doc,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  getDoc,
  deleteDoc,
  getDocs,
  setDoc,
  where,
} from "firebase/firestore";
import { db } from "../services/firebase";
import useAuthStore from "../store/useAuth";
import { useLocation } from "react-router-dom";

// funcçao para encontrar ou criar um chat (mantida)
const findOrCreateChat = async (userUid, otherUid) => {
  const participants = userUid < otherUid ? [userUid, otherUid] : [otherUid, userUid];

  // 1. ve o chat existente usando a array de participantes
  const q = query(collection(db, "chats"), where("participants", "==", participants));
  const snapshot = await getDocs(q);
  let chatDoc = snapshot.docs[0];

  if (chatDoc) {
    return { id: chatDoc.id, exists: true };
  } else {
    // 2. Cria um novo chat
    const newChatRef = doc(collection(db, "chats"));
    await setDoc(newChatRef, {
      participants: participants,
      createdAt: serverTimestamp(),
      lastMessageAt: serverTimestamp(),
    });
    return { id: newChatRef.id, exists: false };
  }
};

export default function Messages() {
  const { user, profileData } = useAuthStore();
  const location = useLocation();

  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const bottomRef = useRef();

  // NOVO ESTADO: Para controlar a largura da janela (responsividade)
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  const isMobile = windowWidth <= 768;


  const queryParams = new URLSearchParams(location.search);
  const startChatWithUid = queryParams.get("startChatWith");

  // useEffect para rastrear a largura da tela
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // buscar ou criar chat dps q carrega o componente (mantida)
  useEffect(() => {
    const initChatFromExternal = async () => {
      if (!startChatWithUid || !user?.uid) return;

      if (selectedChat?.otherUid === startChatWithUid) return;

      // 1. encontra/cria o chat
      const { id: chatId } = await findOrCreateChat(user.uid, startChatWithUid);

      // 2. busca os dados do usuário
      const userSnap = await getDoc(doc(db, "users", startChatWithUid));
      let otherUserData = userSnap.exists() ? userSnap.data() : { nome: "Usuário Desconhecido" };

      // 3. seleciona o chat
      setSelectedChat({
        id: chatId,
        otherUid: startChatWithUid,
        otherUserData: {
          nome: otherUserData.nome || 'Usuário',
          fotoURL: otherUserData.fotoURL || '',
        },
      });


      if (location.search.includes('startChatWith')) {
        window.history.replaceState(null, null, location.pathname);
      }
    };


    if (startChatWithUid && user?.uid) {
      initChatFromExternal();
    }

  }, [startChatWithUid, user?.uid, selectedChat?.otherUid, location.search, location.pathname]);


  // busca os chats recentes (mantida)
  useEffect(() => {
    if (!user?.uid) return;

    const q = query(collection(db, "chats"));
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const chatList = [];
      for (let docSnap of snapshot.docs) {
        const data = docSnap.data();
        if (data.participants?.includes(user.uid)) {
          const otherUid = data.participants.find((uid) => uid !== user.uid);
          let otherUserData = { nome: "Usuário", fotoURL: "" };
          if (otherUid) {
            const userSnap = await getDoc(doc(db, "users", otherUid));
            if (userSnap.exists()) {
              otherUserData = userSnap.data();
            }
          }
          chatList.push({
            id: docSnap.id,
            otherUid,
            otherUserData: {
              nome: otherUserData.nome || 'Usuário',
              fotoURL: otherUserData.fotoURL || '',
            },
            // Adiciona a última mensagem para ordenação no lado do cliente
            lastMessageAt: data.lastMessageAt || null,
          });
        }
      }
      // Ordena os chats pelo horário da última mensagem (mais recente primeiro)
      chatList.sort((a, b) => (b.lastMessageAt?.toMillis() || 0) - (a.lastMessageAt?.toMillis() || 0));
      setChats(chatList);
    });
    return () => unsubscribe();
  }, [user?.uid]);

  // busca as mensagens (mantida)
  useEffect(() => {
    if (!selectedChat) return;

    const q = query(
      collection(db, "chats", selectedChat.id, "messages"),
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setMessages(msgs);

      // Scroll para o final
      if (bottomRef.current) {
        bottomRef.current.scrollIntoView({ behavior: "smooth" });
      }
    });

    return () => unsubscribe();
  }, [selectedChat]);

  const handleSelectChat = (chat) => {
    setSelectedChat(chat);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChat) return;


    await setDoc(doc(db, "chats", selectedChat.id),
      { lastMessageAt: serverTimestamp() },
      { merge: true }
    );

    // add a mensagem
    await addDoc(collection(db, "chats", selectedChat.id, "messages"), {
      fromUid: user.uid,
      fromName: profileData?.nome || user.displayName || "Você",
      text: newMessage,
      createdAt: serverTimestamp(),
    });

    setNewMessage("");
  };

  const handleDeleteChat = async () => {
    if (!selectedChat) return;
    if (!window.confirm("Tem certeza que quer deletar este chat?")) return;

    try {
      // apaga as mensagens do chat
      const msgCol = collection(db, "chats", selectedChat.id, "messages");
      const snapshot = await getDocs(msgCol);
      for (let docSnap of snapshot.docs) {
        await deleteDoc(doc(db, "chats", selectedChat.id, "messages", docSnap.id));
      }

      // apaga o chat
      await deleteDoc(doc(db, "chats", selectedChat.id));
      setSelectedChat(null);
    } catch (error) {
      console.error("Erro ao deletar o chat:", error);
      alert("Houve um erro ao tentar deletar o chat.");
    }
  };


  // Estilos Condicionais para Responsividade
  const responsiveStyles = {
    sidebarDisplay: isMobile && selectedChat ? 'none' : 'block',
    chatWindowDisplay: isMobile && !selectedChat ? 'none' : 'flex',
    sidebarFlex: isMobile ? '1 1 100%' : '0 0 25%',
    chatWindowFlex: isMobile ? '1 1 100%' : '1',
  };


  return (
    <div style={styles.container}>
      {/* --------------------------- Lista de Chats (Sidebar) --------------------------- */}
      <div
        style={{
          ...styles.sidebar,
          display: responsiveStyles.sidebarDisplay,
          flex: responsiveStyles.sidebarFlex,
        }}
      >
        <h3 style={styles.sidebarTitle}>Chats Recentes</h3>
        {chats.length === 0 && <p style={{ textAlign: "center", fontSize: '0.9rem' }}>Nenhum chat</p>}
        <ul style={styles.chatList}>
          {chats.map((chat) => (
            <li
              key={chat.id}
              style={{
                ...styles.chatItem,
                fontWeight: selectedChat?.id === chat.id ? 'bold' : 'normal',
                backgroundColor: selectedChat?.id === chat.id ? '#ffebeb' : '#fff',
                // Simulando o hover, já que :hover não funciona em estilos inline
              }}
              onClick={() => handleSelectChat(chat)}
            >
              <img
                src={chat.otherUserData.fotoURL || "https://via.placeholder.com/40"}
                alt="Foto"
                style={styles.avatar}
              />
              <span>{chat.otherUserData.nome || "Usuário"}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* --------------------------- Janela das Mensagens --------------------------- */}
      <div
        style={{
          ...styles.chatWindow,
          display: responsiveStyles.chatWindowDisplay,
          flex: responsiveStyles.chatWindowFlex,
        }}
      >
        {selectedChat ? (
          <>
            <div style={styles.chatHeader}>
              {/* Botão de Voltar só aparece no mobile */}
              {isMobile && (
                <button onClick={() => setSelectedChat(null)} style={styles.backButton}>
                  ← Voltar
                </button>
              )}
              <h2 style={styles.chatTitle}>{selectedChat.otherUserData.nome}</h2>
              <button onClick={handleDeleteChat} style={styles.deleteButton}>
                🗑️ Deletar Chat
              </button>
            </div>

            <div style={styles.messagesContainer}>
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  style={{
                    ...styles.messageBubble,
                    alignSelf: msg.fromUid === user.uid ? "flex-end" : "flex-start",
                    backgroundColor: msg.fromUid === user.uid ? "#E53E3E" : "#e2e8f0",
                    color: msg.fromUid === user.uid ? "white" : "#333",
                  }}
                >
                  <strong>{msg.fromName === (profileData?.nome || user.displayName) ? "Você" : msg.fromName}: </strong>
                  {msg.text}
                  <br />
                  <small style={styles.messageTime}>
                    {msg.createdAt?.toDate ? msg.createdAt.toDate().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : "Enviando..."}
                  </small>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            <div style={styles.inputArea}>
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Digite sua mensagem..."
                style={styles.input}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <button onClick={handleSendMessage} style={styles.sendButton}>
                Enviar
              </button>
            </div>
          </>
        ) : (
          <div style={styles.welcomeMessage}>
            <h2>Selecione um chat para começar a conversar.</h2>
            <p>Você pode iniciar um novo chat a partir do painel de Vagas ao interagir com um candidato ou empresa.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Estilos (sem media queries dentro, que são ignoradas pelo React)
const styles = {
  container: {
    display: "flex",
    gap: "1rem",
    padding: "1rem",
    backgroundColor: '#ECECEC',
    minHeight: '100vh',
    width: '100%',
    // Flex Wrap adicionado para que as colunas se empilhem se não couberem (útil para o mobile, mesmo com a lógica de display: none)
    flexWrap: 'wrap',
  },
  sidebar: {
    minWidth: "250px",
    flex: "0 0 25%", // Padrão Desktop
    border: "1px solid #E53E3E",
    borderRadius: "8px",
    padding: "0.5rem",
    background: "#fff5f5",
    height: "calc(100vh - 2rem)",
    overflowY: "auto",
    // Os estilos de mobile são aplicados via lógica condicional no JSX
  },
  sidebarTitle: { color: "#E53E3E", textAlign: "center", marginBottom: "0.5rem" },
  chatList: { listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.5rem" },
  chatItem: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    padding: "0.75rem",
    borderRadius: "6px",
    cursor: "pointer",
    border: "1px solid #E53E3E",
    background: "#fff",
    transition: 'background-color 0.2s',
  },
  avatar: { width: "40px", height: "40px", borderRadius: "50%", objectFit: 'cover' },
  chatWindow: {
    flex: 1, // Padrão Desktop
    minWidth: "300px",
    display: "flex",
    flexDirection: "column",
    background: 'white',
    borderRadius: '8px',
    padding: '1rem',
  },
  welcomeMessage: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    color: '#a0aec0',
  },
  chatHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: "0.5rem",
    borderBottom: '1px solid #ccc',
  },
  chatTitle: { color: "#E53E3E", flex: 1, textAlign: 'center', margin: 0, fontSize: '1.25rem' },
  backButton: {
    background: "transparent",
    border: "none",
    color: "#E53E3E",
    cursor: "pointer",
    fontWeight: "bold",
    padding: '0.5rem',
  },
  deleteButton: {
    background: "#ef4444",
    color: "white",
    border: "none",
    borderRadius: "6px",
    padding: "0.25rem 0.5rem",
    cursor: "pointer",
    fontSize: '0.8rem',
    marginLeft: 'auto', // Garante que o botão fique na ponta direita
  },
  messagesContainer: {
    flex: 1,
    overflowY: "auto",
    padding: "1rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
  },
  messageBubble: {
    maxWidth: "85%", // Aumentei a largura máxima no mobile para evitar quebras estranhas
    padding: "0.75rem",
    borderRadius: "12px",
    wordBreak: "break-word",
    fontSize: '0.9rem',
  },
  messageTime: {
    display: "block",
    fontSize: "0.65rem",
    marginTop: "0.2rem",
    opacity: 0.8,
    textAlign: 'right',
  },
  inputArea: { display: "flex", marginTop: "1rem", gap: "0.5rem", padding: '0.5rem 0' },
  input: { flex: 1, padding: "0.75rem", border: "1px solid #E53E3E", borderRadius: "8px", minWidth: "150px" },
  sendButton: {
    background: "#E53E3E",
    color: "white",
    border: "none",
    borderRadius: "8px",
    padding: "0.75rem 1.5rem",
    cursor: "pointer",
    fontWeight: "bold",
    transition: 'opacity 0.2s',
  },
};