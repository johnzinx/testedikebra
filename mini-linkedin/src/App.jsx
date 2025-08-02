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


// NOVO: importar a página pública de perfil
import Perfil from './pages/Perfil'

export default function App() {
  const { user } = useAuth()

  // Layout principal (só com login)
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
        path="/"
        element={
          <PrivateLayout>
            <Feed />
          </PrivateLayout>
        }
      />
      <Route
        path="/feed"
        element={
          <PrivateLayout>
            <Feed />
          </PrivateLayout>
        }
      />
      <Route
        path="/profile/:uid"
        element={
          <PrivateLayout>
            <Profile />
          </PrivateLayout>
        }
      />
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
      <Route path="/login" element={<Login />} />
      <Route path="/perfil/:uid" element={<Perfil />} />



      {/* QUALQUER OUTRA ROTA REDIRECIONA */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
