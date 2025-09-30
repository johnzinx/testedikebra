import { Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import Feed from './routes/Feed'
import Profile from './routes/Profile'
import Jobs from './routes/Jobs'
import Messages from './routes/Messages'
import Notifications from './routes/Notifications'
import Settings from './routes/Settings'
import Login from './routes/Login'
import useAuth from './store/useAuth'
import EditProfile from './routes/EditProfile'

// páginas públicas
import Perfil from './pages/Perfil'
import Home from './routes/Home'

export default function App() {
  const { user } = useAuth()

  // pagina principal aq
  const PrivateLayout = ({ children }) => {
    if (!user) return <Navigate to="/login" replace />
    return (
      <div className="app">
        <Navbar />
        <div className="container">
          <Sidebar />
          <main className="content">{children}</main>
        </div>
      </div>
    )
  }

  return (
    <Routes>
      {/* ROTAS PRIVADAS */}
      <Route
        path="/feed"
        element={
          <PrivateLayout>
            <Feed />
          </PrivateLayout>
        }
      />
      
      {/* ROTA: Perfil de outro usuário (com UID na URL) */}
      <Route
        path="/profile/:uidExterno" 
        element={
          <PrivateLayout>
            <Profile />
          </PrivateLayout>
        }
      />
      
      {/* ROTA: Perfil do usuário logado (sem UID na URL) */}
      <Route
        path="/profile"
        element={
          <PrivateLayout>
            <Profile />
          </PrivateLayout>
        }
      />
      
      {/* Mantive a rota de edição como você enviou, mas note que ela provavelmente deve
          ser acessada via '/profile/edit' se o Profile.jsx estiver tratando a edição
          internamente, ou você pode remover esta rota se EditProfile for um componente
          separado apenas para edição. */}
      <Route
        path="/profile/:id/edit"
        element={
          <PrivateLayout>
            <EditProfile />
          </PrivateLayout>
        }
      />
      <Route
        path="/jobs"
        element={
          <PrivateLayout>
            <Jobs />
          </PrivateLayout>
        }
      />
      <Route
        path="/messages"
        element={
          <PrivateLayout>
            <Messages />
          </PrivateLayout>
        }
      />
      <Route
        path="/notifications"
        element={
          <PrivateLayout>
            <Notifications />
          </PrivateLayout>
        }
      />
      <Route
        path="/settings"
        element={
          <PrivateLayout>
            <Settings />
          </PrivateLayout>
        }
      />

      {/* ROTAS PÚBLICAS */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      
      {/* Se 'Perfil' for um componente público para ver perfis, ajuste aqui também */}
      <Route path="/perfil/:uidExterno" element={<Perfil />} />

      {/* QUALQUER OUTRA ROTA REDIRECIONA PARA HOME */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}