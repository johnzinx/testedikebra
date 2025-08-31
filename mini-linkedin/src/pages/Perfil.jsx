import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithCustomToken, signInAnonymously } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';

// Componente Perfil (Visualização de outros perfis)
export function Perfil({ db, viewingUid, setCurrentPage }) {
  const [perfil, setPerfil] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    if (!viewingUid || !db) return;

    setCarregando(true);
    const docRef = doc(db, `artifacts/${__app_id}/users/${viewingUid}`);

    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = { ...docSnap.data(), uid: viewingUid };
        setPerfil(data);
      } else {
        setPerfil(null);
      }
      setCarregando(false);
    }, (error) => {
      console.error('Erro ao buscar perfil:', error);
      setPerfil(null);
      setCarregando(false);
    });

    return () => unsubscribe();
  }, [viewingUid, db]);

  if (carregando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-200">
        <p className="text-gray-600 text-lg animate-pulse">Carregando perfil...</p>
      </div>
    );
  }

  if (!perfil) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-200">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6 text-center">
            <p className="text-red-500 text-lg font-semibold mb-4">Perfil não encontrado.</p>
            <button
                onClick={() => setCurrentPage('profile')}
                className="w-full py-3 rounded-xl bg-blue-500 text-white font-bold shadow hover:bg-blue-600 transition"
            >
                Voltar para o seu perfil
            </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-200 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6">
        <div className="flex flex-col items-center">
          <div className="w-24 h-24 bg-yellow-300 rounded-full flex items-center justify-center text-4xl font-bold text-gray-800">
            {perfil?.nome ? perfil.nome[0]?.toUpperCase() : "?"}
          </div>
          <h1 className="mt-4 text-2xl font-extrabold text-gray-900">{perfil.nome}</h1>
          <p className="text-gray-600">{perfil.email}</p>
          <p className="text-sm mt-2 text-gray-500">ID: {viewingUid}</p>
        </div>

        <div className="mt-6">
          <h2 className="text-lg font-semibold text-gray-800">Bio</h2>
          <p className="text-gray-700">{perfil.bio || "Sem bio ainda."}</p>
        </div>

        <div className="mt-6">
          <h2 className="text-lg font-semibold text-gray-800">Experiências</h2>
          {perfil.experiencias?.length ? (
            <ul className="list-disc list-inside text-gray-700">
              {perfil.experiencias.map((exp, idx) => (
                <li key={idx}>{exp}</li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 italic">Nenhuma experiência cadastrada.</p>
          )}
        </div>

        <div className="mt-6">
          <h2 className="text-lg font-semibold text-gray-800">Skills</h2>
          {perfil.skills?.length ? (
            <ul className="flex flex-wrap gap-2">
              {perfil.skills.map((skill, idx) => (
                <li key={idx} className="bg-yellow-200 text-gray-800 px-3 py-1 rounded-full">
                  {skill}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 italic">Nenhuma skill cadastrada.</p>
          )}
        </div>

        <div className="mt-8">
            <button
                onClick={() => setCurrentPage('profile')}
                className="w-full py-3 rounded-xl bg-blue-500 text-white font-bold shadow hover:bg-blue-600 transition"
            >
                Voltar
            </button>
        </div>
      </div>
    </div>
  );
}

// Componente Meu Perfil (Visualização e Pesquisa)
export function Profile({ user, db, setCurrentPage, setViewingUid }) {
  const [perfil, setPerfil] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [searchUid, setSearchUid] = useState('');

  useEffect(() => {
    if (!user || !db) return;

    setCarregando(true);
    const docRef = doc(db, `artifacts/${__app_id}/users/${user.uid}`);

    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = { ...docSnap.data(), uid: user.uid };
        setPerfil(data);
      } else {
        setPerfil(null);
      }
      setCarregando(false);
    }, (error) => {
      console.error('Erro ao buscar perfil:', error);
      setPerfil(null);
      setCarregando(false);
    });

    return () => unsubscribe();
  }, [user, db]);

  const handleSearch = () => {
    if (searchUid.length > 0) {
        setViewingUid(searchUid);
        setCurrentPage('perfil');
    }
  };

  if (carregando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-200">
        <p className="text-gray-600 text-lg animate-pulse">Carregando perfil...</p>
      </div>
    );
  }

  if (!perfil) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-200">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6 text-center">
            <p className="text-red-500 text-lg font-semibold mb-4">Seu perfil não foi encontrado. Talvez você precise criar um.</p>
            <button
                onClick={() => setCurrentPage('editProfile')}
                className="w-full py-3 rounded-xl bg-yellow-300 text-gray-900 font-bold shadow hover:bg-yellow-400 transition"
            >
                Criar Perfil
            </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-200 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6">
        <div className="flex flex-col items-center">
          <div className="w-24 h-24 bg-yellow-300 rounded-full flex items-center justify-center text-4xl font-bold text-gray-800">
            {perfil.nome ? perfil.nome[0]?.toUpperCase() : "?"}
          </div>
          <h1 className="mt-4 text-2xl font-extrabold text-gray-900">{perfil.nome}</h1>
          <p className="text-gray-600">{perfil.email}</p>
          <p className="text-sm mt-2 text-gray-500">ID: {user?.uid}</p>
        </div>

        <div className="mt-6">
          <h2 className="text-lg font-semibold text-gray-800">Bio</h2>
          <p className="text-gray-700">{perfil.bio || "Sem bio ainda."}</p>
        </div>

        <div className="mt-6">
          <h2 className="text-lg font-semibold text-gray-800">Experiências</h2>
          {perfil.experiencias?.length ? (
            <ul className="list-disc list-inside text-gray-700">
              {perfil.experiencias.map((exp, idx) => (
                <li key={idx}>{exp}</li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 italic">Nenhuma experiência cadastrada.</p>
          )}
        </div>

        <div className="mt-6">
          <h2 className="text-lg font-semibold text-gray-800">Skills</h2>
          {perfil.skills?.length ? (
            <ul className="flex flex-wrap gap-2">
              {perfil.skills.map((skill, idx) => (
                <li key={idx} className="bg-yellow-200 text-gray-800 px-3 py-1 rounded-full">
                  {skill}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 italic">Nenhuma skill cadastrada.</p>
          )}
        </div>

        <div className="mt-8">
          <button
            onClick={() => setCurrentPage('editProfile')}
            className="w-full py-3 rounded-xl bg-yellow-300 text-gray-900 font-bold shadow hover:bg-yellow-400 transition"
          >
            Editar Perfil
          </button>
        </div>
        
        <div className="mt-8 pt-4 border-t border-gray-300">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Ver outro perfil por UID</h2>
          <input
            type="text"
            value={searchUid}
            onChange={(e) => setSearchUid(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none"
            placeholder="Digite o UID do perfil"
          />
          <button
            onClick={handleSearch}
            className="mt-2 w-full py-3 rounded-xl bg-blue-500 text-white font-bold shadow hover:bg-blue-600 transition"
          >
            Buscar Perfil
          </button>
        </div>
      </div>
    </div>
  );
}

// Componente Editar Perfil
export function EditProfile({ user, db, setCurrentPage }) {
  const [form, setForm] = useState({
    nome: '',
    bio: '',
    skills: '',
    experiencias: '',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !db) return;

    const fetchData = async () => {
      const ref = doc(db, `artifacts/${__app_id}/users/${user.uid}`);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        setForm({
          nome: data.nome || '',
          bio: data.bio || '',
          skills: data.skills?.join(', ') || '',
          experiencias: data.experiencias?.join(', ') || '',
        });
      }
      setLoading(false);
    };

    fetchData();
  }, [user, db]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const salvar = async () => {
    if (!user || !db) return;
    try {
        const ref = doc(db, `artifacts/${__app_id}/users/${user.uid}`);
        await setDoc(ref, {
          nome: form.nome,
          bio: form.bio,
          skills: form.skills.split(',').map(s => s.trim()).filter(s => s.length > 0),
          experiencias: form.experiencias.split(',').map(e => e.trim()).filter(e => e.length > 0),
          email: user.email || 'email@exemplo.com'
        });
        setCurrentPage('profile');
    } catch (error) {
        console.error("Erro ao salvar o perfil:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-200">
        <p className="text-gray-600 text-lg animate-pulse">Carregando dados...</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-lg rounded-2xl w-full max-w-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Editar Perfil</h2>

        <div className="space-y-4">
          <input
            name="nome"
            value={form.nome}
            onChange={handleChange}
            className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400"
            placeholder="Nome"
          />
          <textarea
            name="bio"
            value={form.bio}
            onChange={handleChange}
            rows="4"
            className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 resize-none"
            placeholder="Bio"
          />
          <input
            name="skills"
            value={form.skills}
            onChange={handleChange}
            className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400"
            placeholder="Skills (separadas por vírgula)"
          />
          <input
            name="experiencias"
            value={form.experiencias}
            onChange={handleChange}
            className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400"
            placeholder="Experiências (separadas por vírgula)"
          />
        </div>

        <div className="mt-6 flex gap-3">
          <button
              onClick={() => setCurrentPage('profile')}
              className="flex-1 py-3 rounded-xl bg-gray-300 text-gray-800 font-semibold hover:bg-gray-400 transition"
          >
              Cancelar
          </button>
          <button
            onClick={salvar}
            className="flex-1 py-3 rounded-xl bg-yellow-300 text-gray-900 font-bold shadow hover:bg-yellow-400 transition"
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
}

// Componente principal que gerencia o estado da aplicação
export default function App() {
  const [user, setUser] = useState(null);
  const [db, setDb] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [currentPage, setCurrentPage] = useState('profile');
  const [viewingUid, setViewingUid] = useState(null);

  // Configuração e inicialização do Firebase
  useEffect(() => {
    const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
    const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
    const app = initializeApp(firebaseConfig);
    const authInstance = getAuth(app);
    const dbInstance = getFirestore(app);

    const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

    const signIn = async () => {
      try {
        if (initialAuthToken) {
          await signInWithCustomToken(authInstance, initialAuthToken);
        } else {
          await signInAnonymously(authInstance);
        }
      } catch (error) {
        console.error("Firebase Auth Error:", error);
      }
    };

    signIn();

    const unsubscribe = authInstance.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      }
      setDb(dbInstance);
      setIsAuthReady(true);
    });

    return () => unsubscribe();
  }, []);

  if (!isAuthReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-200">
        <p className="text-gray-600 text-lg animate-pulse">Carregando...</p>
      </div>
    );
  }

  // Lógica de navegação
  const renderPage = () => {
    switch (currentPage) {
      case 'profile':
        return <Profile user={user} db={db} setCurrentPage={setCurrentPage} setViewingUid={setViewingUid} />;
      case 'perfil':
        return <Perfil db={db} viewingUid={viewingUid} setCurrentPage={setCurrentPage} />;
      case 'editProfile':
        return <EditProfile user={user} db={db} setCurrentPage={setCurrentPage} />;
      default:
        return <Profile user={user} db={db} setCurrentPage={setCurrentPage} setViewingUid={setViewingUid} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-200">
      <style>
        {`
          body {
              font-family: 'Inter', sans-serif;
              background-color: #f3f4f6;
          }
        `}
      </style>
      <script src="https://cdn.tailwindcss.com"></script>
      {renderPage()}
    </div>
  );
}
