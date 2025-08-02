import { Link, useNavigate } from 'react-router-dom'
import useAuth from '../store/useAuth'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="navbar">
      <Link to="/feed" className="brand">miniLinkedIn</Link>
      <nav>
        <Link to="/feed">Feed</Link>
        <Link to={`/profile/${user?.id}`}>Perfil</Link>
        <Link to="/jobs">Vagas</Link>
        <Link to="/messages">Chats</Link>
        <Link to="/notifications">Notificações</Link>
        <Link to="/settings">Configurações</Link>
      </nav>
      <div className="user">
        {user && (
          <>
            <img src={user.avatar} alt={user.name} className="avatar" />
            <span>{user.name}</span>
            <button onClick={handleLogout}>Sair</button>
          </>
        )}
      </div>
    </header>
  )
}
