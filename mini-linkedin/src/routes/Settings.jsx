import useAuth from '../store/useAuth'

export default function Settings() {
  const { user } = useAuth()
  return (
    <section>
      <h1>Configurações</h1>
      <div className="card">
        <h3>Conta</h3>
        <p>Email: {user?.email}</p>
        <button className="btn outline">Alterar senha (um dia 😅)</button>
      </div>
    </section>
  )
}
