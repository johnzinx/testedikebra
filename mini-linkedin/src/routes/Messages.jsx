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
} from "firebase/firestore";
import { db } from "../services/firebase";
import useAuthStore from "../store/useAuth";

export default function Messages() {
  const { user, profileData } = useAuthStore();
  const [chats, setChats] = useState([]); // chats recentes
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const bottomRef = useRef();

  // Buscar chats recentes do usuário
  useEffect(() => {
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
            otherUserData,
          });
        }
      }
      setChats(chatList);
    });
    return () => unsubscribe();
  }, [user.uid]);

  // Buscar mensagens do chat selecionado
  useEffect(() => {
    if (!selectedChat) return;

    const q = query(
      collection(db, "chats", selectedChat.id, "messages"),
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setMessages(msgs);
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    });

    return () => unsubscribe();
  }, [selectedChat]);

  const handleSelectChat = (chat) => {
    setSelectedChat(chat);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChat) return;

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

    // Deletar todas as mensagens do chat
    const msgCol = collection(db, "chats", selectedChat.id, "messages");
    const snapshot = await getDocs(msgCol);
    for (let docSnap of snapshot.docs) {
      await deleteDoc(doc(db, "chats", selectedChat.id, "messages", docSnap.id));
    }

    // Deletar o chat
    await deleteDoc(doc(db, "chats", selectedChat.id));
    setSelectedChat(null);
  };

  return (
    <div style={styles.container}>
      {!selectedChat ? (
        <div style={styles.sidebar}>
          <h3 style={styles.sidebarTitle}>Chats Recentes</h3>
          {chats.length === 0 && <p style={{ textAlign: "center" }}>Nenhum chat</p>}
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
                <span>{chat.otherUserData.nome || "Usuário"}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div style={styles.chatWindow}>
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
                  {msg.createdAt?.toDate ? msg.createdAt.toDate().toLocaleTimeString() : ""}
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
            />
            <button onClick={handleSendMessage} style={styles.sendButton}>
              Enviar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: "1rem",
    padding: "1rem",
  },
  sidebar: {
    minWidth: "200px",
    maxWidth: "250px",
    flex: "1",
    border: "1px solid #E53E3E",
    borderRadius: "8px",
    padding: "0.5rem",
    background: "#fff5f5",
    height: "70vh",
    overflowY: "auto",
  },
  sidebarTitle: { color: "#E53E3E", textAlign: "center", marginBottom: "0.5rem" },
  chatList: { listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.5rem" },
  chatItem: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    padding: "0.5rem",
    borderRadius: "6px",
    cursor: "pointer",
    border: "1px solid #E53E3E",
    background: "#fff",
  },
  avatar: { width: "40px", height: "40px", borderRadius: "50%" },
  chatWindow: {
    flex: 3,
    minWidth: "300px",
    display: "flex",
    flexDirection: "column",
  },
  chatHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "0.5rem",
  },
  chatTitle: { textAlign: "center", color: "#E53E3E", flex: 1 },
  backButton: {
    background: "transparent",
    border: "none",
    color: "#E53E3E",
    cursor: "pointer",
    fontWeight: "bold",
  },
  deleteButton: {
    background: "#ef4444",
    color: "white",
    border: "none",
    borderRadius: "6px",
    padding: "0.25rem 0.5rem",
    cursor: "pointer",
  },
  messagesContainer: {
    flex: 1,
    overflowY: "auto",
    border: "1px solid #E53E3E",
    borderRadius: "8px",
    padding: "0.5rem",
    background: "#fff5f5",
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
    minHeight: "50vh",
  },
  messageBubble: {
    maxWidth: "70%",
    padding: "0.5rem 0.8rem",
    borderRadius: "12px",
    wordBreak: "break-word",
  },
  messageTime: {
    display: "block",
    fontSize: "0.7rem",
    marginTop: "0.2rem",
    opacity: 0.7,
  },
  inputArea: { display: "flex", marginTop: "0.5rem", gap: "0.5rem", flexWrap: "wrap" },
  input: { flex: 1, padding: "0.5rem", border: "1px solid #E53E3E", borderRadius: "8px", minWidth: "150px" },
  sendButton: {
    background: "#E53E3E",
    color: "white",
    border: "none",
    borderRadius: "8px",
    padding: "0.5rem 1rem",
    cursor: "pointer",
    fontWeight: "bold",
  },
};
