import { mockMessages } from '../api/mock'

export default function Messages() {
  return (
    <section>
      <h1>Chats</h1>
      <ul className="list">
        {mockMessages.map(msg => (
          <li key={msg.id} className="card">
            <strong>{msg.from.name}</strong>
            <p className="muted">{msg.snippet}</p>
            <small>{new Date(msg.time).toLocaleString()}</small>
          </li>
        ))}
      </ul>
    </section>
  )
}
