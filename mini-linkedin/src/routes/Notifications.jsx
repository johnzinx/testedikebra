import React, { useEffect, useState } from 'react';
import { collection, query, where, orderBy, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { db } from '../services/firebase';
import useAuthStore from '../store/useAuth';
import { useNavigate } from 'react-router-dom';
import { FiMessageSquare, FiUser } from 'react-icons/fi'; 

export default function Notifications() {
  const { user } = useAuthStore();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();


  // marca como lida no firestrore
  const handleMarkAsRead = async (id) => {
    try {
      const docRef = doc(db, 'notifications', id);
      await updateDoc(docRef, { read: true }); 
    } catch (e) {
      console.error("Erro ao marcar como lida:", e);
    }
  };

  // iniciar chat com remetente
  const handleChat = (notification) => {
    handleMarkAsRead(notification.id);
    navigate(`/messages?startChatWith=${notification.senderUid}`); 
  };

  // visualizar perfil remetente
  const handleViewProfile = (notification) => {
    handleMarkAsRead(notification.id);
    navigate(`/profile/${notification.senderUid}`);
  };


  // tempo real notificação
  useEffect(() => {
    if (!user || !user.uid) {
      setLoading(false);
      return;
    }

    const notificationsQuery = query(
      collection(db, 'notifications'),
      where('recipientUid', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(notificationsQuery, (snapshot) => {
      const notificationsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setNotifications(notificationsList);
      setLoading(false);
    }, (error) => {
      console.error("Erro ao buscar notificações:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // funçao de visualizar

  const formatTime = (timestamp) => {
    const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    }).replace(',', ' às');
  };

  const getIcon = (type) => {
    switch (type) {
      case 'like': return '❤️';
      case 'comment': return '💬';
      case 'follow': return '👤';
      case 'application': return '💼'; 
      default: return '🔔';
    }
  };

  // estilos

  const styles = {
    container: {
      maxWidth: '600px',
      margin: '0 auto',
      padding: '1.5rem',
      backgroundColor: '#f9fafb',
      minHeight: '100vh',
    },
    header: {
      fontSize: '2rem',
      fontWeight: '700',
      color: '#1f2937',
      marginBottom: '1.5rem',
      borderBottom: '2px solid #e5e7eb',
      paddingBottom: '0.75rem',
    },
    list: {
      listStyle: 'none',
      padding: 0,
      margin: 0,
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem',
    },
    card: (isRead) => ({
      display: 'flex',
      flexDirection: 'column',
      padding: '1rem',
      backgroundColor: isRead ? 'white' : '#eff6ff', 
      borderRadius: '0.75rem',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      borderLeft: isRead ? '4px solid #ccc' : '4px solid #3b82f6', 
      cursor: 'pointer',
      transition: 'all 0.3s',
    }),
    contentRow: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: '0.75rem',
    },
    textWrapper: {
      flexGrow: 1,
      marginLeft: '0.75rem',
      display: 'flex',
      flexDirection: 'column',
    },
    notificationText: {
      fontSize: '1rem',
      color: '#374151',
      fontWeight: '500',
      lineHeight: '1.4',
    },
    time: {
      fontSize: '0.75rem',
      color: '#6b7280',
      marginTop: '0.25rem',
    },
    icon: {
      fontSize: '1.5rem',
    },
    actionButtons: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '0.5rem',
    },
    profileButton: {
      background: '#10b981', 
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      padding: '0.5rem 0.75rem',
      cursor: 'pointer',
      fontWeight: 'bold',
      display: 'flex',
      alignItems: 'center',
    },
    chatButton: {
      background: '#3b82f6', 
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      padding: '0.5rem 0.75rem',
      cursor: 'pointer',
      fontWeight: 'bold',
      display: 'flex',
      alignItems: 'center',
    },
  };


  
  return (
    <div style={styles.container}>
      <h1 style={styles.header}>Notificações <span style={{ fontSize: '1.5rem' }}>🔔</span></h1>
      
      <ul style={styles.list}>
        {notifications.length > 0 ? (
          notifications.map(n => (
            <li key={n.id} 
                style={styles.card(n.read)}
                // ajuda a evitar o duplo click
            >
              <div style={styles.contentRow} onClick={() => handleMarkAsRead(n.id)}>
                <div style={styles.icon}>{getIcon(n.type)}</div>
                
                <div style={styles.textWrapper}>
                  <p style={styles.notificationText}>{n.message || n.text || 'Nova atividade'}</p> 
                  <small style={styles.time}>{formatTime(n.createdAt)}</small>
                </div>
              </div>
              
              
              {n.senderUid && n.senderUid !== user.uid && (
                <div style={styles.actionButtons}>
                  <button 
                    onClick={() => handleViewProfile(n)} 
                    style={styles.profileButton}
                  >
                    <FiUser style={{ marginRight: '0.3rem' }} /> Perfil
                  </button>
                  <button 
                    onClick={() => handleChat(n)} 
                    style={styles.chatButton}
                  >
                    <FiMessageSquare style={{ marginRight: '0.3rem' }} /> Chat
                  </button>
                </div>
              )}
            </li>
          ))
        ) : (
          <p style={{ textAlign: 'center', color: '#6b7280', marginTop: '2rem' }}>
             Nenhuma notificação nova por enquanto!
          </p>
        )}
      </ul>
    </div>
  );
}