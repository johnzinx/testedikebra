import { Link } from 'react-router-dom'
import useAuth from '../store/useAuth'

export default function Sidebar() {
  const { user } = useAuth()
  return (
    <aside className="sidebar">
      {user && (
        <div className="card">
          <img src={user.avatar} alt={user.name} className="avatar lg" />
          <h3>{user.name}</h3>
          <p className="muted">{user.headline}</p>
          <Link to={`/profile/${user.id}`} className="btn">Ver perfil</Link>
        </div>
      )}

      <div className="card">
        <h4>Atalhos</h4>
        <ul>
          <li><Link to="/jobs">Procurar vagas</Link></li>
          <li><Link to="/messages">Mensagens</Link></li>
          <li><Link to="/settings">Configurações</Link></li>
        </ul>
      </div>
    </aside>
  )
}
