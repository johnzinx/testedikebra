import { useEffect, useState, useRef } from "react";
// Adicionado 'setDoc' e 'where' ao import
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
// Importado useLocation para ler parâmetros da URL
import { useLocation } from "react-router-dom"; 

// Função auxiliar para encontrar ou criar um chat
const findOrCreateChat = async (userUid, otherUid) => {
  // Garante que a ordem dos UIDs seja consistente para fácil busca
  const participants = userUid < otherUid ? [userUid, otherUid] : [otherUid, userUid];

  // 1. Busca o chat existente usando a array de participantes ordenada
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
  const location = useLocation(); // Hook para acessar a URL
  
  const [chats, setChats] = useState([]); 
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const bottomRef = useRef();
  
  // Extrai o UID para iniciar o chat da URL (e.g., /messages?startChatWith=algumUID)
  const queryParams = new URLSearchParams(location.search);
  const startChatWithUid = queryParams.get("startChatWith");

  // Efeito para buscar ou criar o chat ao carregar o componente, se houver um UID externo
  useEffect(() => {
    const initChatFromExternal = async () => {
      if (!startChatWithUid || !user?.uid) return;

      // Verifica se o chat já está selecionado para evitar loops
      if (selectedChat?.otherUid === startChatWithUid) return;

      // 1. Encontra/Cria o chat
      const { id: chatId } = await findOrCreateChat(user.uid, startChatWithUid);

      // 2. Busca os dados do usuário externo
      const userSnap = await getDoc(doc(db, "users", startChatWithUid));
      let otherUserData = userSnap.exists() ? userSnap.data() : { nome: "Usuário Desconhecido" };

      // 3. Seleciona o chat
      setSelectedChat({
        id: chatId,
        otherUid: startChatWithUid,
        otherUserData: {
          nome: otherUserData.nome || 'Usuário',
          fotoURL: otherUserData.fotoURL || '',
        },
      });
      
      // Limpa o parâmetro da URL para não tentar iniciar o chat novamente após a seleção
      if (location.search.includes('startChatWith')) {
        window.history.replaceState(null, null, location.pathname);
      }
    };

    // Só executa se houver um UID externo e o componente estiver pronto
    if (startChatWithUid && user?.uid) {
      initChatFromExternal();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startChatWithUid, user?.uid]);


  // Busca os chats recentes
  useEffect(() => {
    if (!user?.uid) return; // Garante que o usuário está logado

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
          });
        }
      }
      setChats(chatList);
    });
    return () => unsubscribe();
  }, [user?.uid]);

  // Busca as mensagens
  useEffect(() => {
    if (!selectedChat) return;

    const q = query(
      collection(db, "chats", selectedChat.id, "messages"),
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setMessages(msgs);
      // Desce o scroll para a última mensagem
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    });

    return () => unsubscribe();
  }, [selectedChat]);

  const handleSelectChat = (chat) => {
    setSelectedChat(chat);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChat) return;

    // 1. Atualiza o campo 'lastMessageAt' do chat pai (para ordenação futura)
    await setDoc(doc(db, "chats", selectedChat.id), 
      { lastMessageAt: serverTimestamp() }, 
      { merge: true }
    );

    // 2. Adiciona a nova mensagem
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

    // Apaga mensagens do chat
    const msgCol = collection(db, "chats", selectedChat.id, "messages");
    const snapshot = await getDocs(msgCol);
    for (let docSnap of snapshot.docs) {
      await deleteDoc(doc(db, "chats", selectedChat.id, "messages", docSnap.id));
    }

    // Deleta o chat
    await deleteDoc(doc(db, "chats", selectedChat.id));
    setSelectedChat(null);
  };

  return (
    <div style={styles.container}>
      {/* SIDEBAR: Lista de Chats */}
      <div style={styles.sidebar}>
          <h3 style={styles.sidebarTitle}>Chats Recentes</h3>
          {chats.length === 0 && <p style={{ textAlign: "center", fontSize: '0.9rem' }}>Nenhum chat</p>}
          <ul style={styles.chatList}>
            {chats.map((chat) => (
              <li
                key={chat.id}
                style={styles.chatItem}
                onClick={() => handleSelectChat(chat)}
              >
                <img
                  src={chat.otherUserData.fotoURL || "https://via.placeholder.com/40"}
                  alt="Foto"
                  style={styles.avatar}
                />
                <span style={{ fontWeight: selectedChat?.id === chat.id ? 'bold' : 'normal' }}>{chat.otherUserData.nome || "Usuário"}</span>
              </li>
            ))}
          </ul>
      </div>
    
      {/* CHAT WINDOW: Janela de Mensagens */}
      <div style={styles.chatWindow}>
          {selectedChat ? (
            <>
              <div style={styles.chatHeader}>
                <button onClick={() => setSelectedChat(null)} style={styles.backButton}>
                  ← Voltar
                </button>
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
                    <strong>{msg.fromName}: </strong>
                    {msg.text}
                    <br />
                    <small style={styles.messageTime}>
                      {msg.createdAt?.toDate ? msg.createdAt.toDate().toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'}) : ""}
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

const styles = {
  container: {
    display: "flex",
    gap: "1rem",
    padding: "1rem",
    backgroundColor: '#ECECEC',
    minHeight: '100vh',
    width: '100%',
  },
  sidebar: {
    minWidth: "250px",
    flex: "0 0 25%", // Ocupa 25% da largura no desktop
    border: "1px solid #E53E3E",
    borderRadius: "8px",
    padding: "0.5rem",
    background: "#fff5f5",
    height: "calc(100vh - 2rem)",
    overflowY: "auto",
    '@media (maxWidth: 768px)': {
      flex: "1 1 100%",
    },
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
    ':hover': {
      backgroundColor: '#ffebeb',
    }
  },
  avatar: { width: "40px", height: "40px", borderRadius: "50%", objectFit: 'cover' },
  chatWindow: {
    flex: 1, // Ocupa o restante do espaço
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
    maxWidth: "70%",
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
    ':hover': {
      opacity: 0.9,
    }
  },
};