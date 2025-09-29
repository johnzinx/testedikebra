  import { useState } from 'react';
  import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
  import { db } from '../services/firebase';
  import useAuthStore from '../store/useAuth';

  export default function PostBox() {
    const [texto, setTexto] = useState('');
    const { user } = useAuthStore();

    const postar = async () => {
      if (!texto.trim()) {
        alert('Por favor, escreva algo antes de publicar!'); // Feedback para o usuário
        return;
      }

      try {
        await addDoc(collection(db, 'posts'), {
          texto,
          criadoEm: serverTimestamp(),
          autor: {
            uid: user.uid,
            nome: user.displayName || 'Anônimo',
            email: user.email,
          },
          curtidas: [],
          comentarios: []
        });
        setTexto('');
        // alert('Post publicado com sucesso!'); // Feedback opcional
      } catch (error) {
        console.error('Erro ao publicar post:', error);
        alert('Ocorreu um erro ao publicar o post. Tente novamente.'); // Feedback de erro
      }
    };

    return (
      <div
        style={{
          backgroundColor: 'white',
          padding: '1.5rem', // Aumenta o padding
          borderRadius: '1rem', // Borda mais arredondada
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)', // Sombra mais proeminente
          marginBottom: '1.5rem', // Mais espaço abaixo
          border: '1px solid #e0e0e0', // Borda sutil
          maxWidth: '600px', // Limita a largura para melhor leitura
          margin: '0 auto 1.5rem auto', // Centraliza e mantém o margin-bottom
        }}
      >
        <h2 style={{
          fontSize: '1.5rem', // Título maior
          fontWeight: '700', // Mais negrito
          color: '#333',
          marginBottom: '1rem', // Espaço abaixo do título
          textAlign: 'center', // Centraliza o texto
        }}>
          Crie uma Nova Publicação
        </h2>
        <textarea
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="O que você está pensando hoje, campeão?"
          rows={4} // Aumenta o número de linhas padrão
          style={{
            width: '100%',
            border: '1px solid #ccc', // Borda mais suave
            borderRadius: '0.5rem', // Borda um pouco mais arredondada
            padding: '1rem', // Mais padding interno
            resize: 'vertical', // Permite redimensionar verticalmente
            outline: 'none',
            transition: 'all 0.3s ease-in-out', // Transição suave para foco
            fontFamily: 'inherit',
            fontSize: '1rem',
            boxSizing: 'border-box', // Garante que padding e border não aumentem a largura
          }}
          // Efeito de foco mais bonito
          onFocus={(e) => {
            e.target.style.borderColor = '#66b3ff'; // Borda azul ao focar
            e.target.style.boxShadow = '0 0 0 3px rgba(102, 179, 255, 0.25)'; // Sombra suave ao focar
          }}
          onBlur={(e) => {
            e.target.style.borderColor = '#ccc';
            e.target.style.boxShadow = 'none';
          }}
        />
        <button
          onClick={postar}
          style={{
            marginTop: '1.25rem', // Mais espaço acima do botão
            backgroundColor: '#4CAF50', // Cor verde mais amigável
            color: 'white',
            padding: '0.75rem 1.5rem', // Aumenta o padding do botão
            borderRadius: '0.5rem', // Borda mais arredondada
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.3s ease-in-out', // Transição suave
            fontSize: '1.1rem', // Texto maior no botão
            fontWeight: '600', // Mais negrito
            width: '100%', // Botão ocupa toda a largura
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#45a049'} // Escurece no hover
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#4CAF50'}
        >
          Publicar
        </button>
      </div>
    );
  }