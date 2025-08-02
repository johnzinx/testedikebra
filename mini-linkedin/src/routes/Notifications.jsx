export default function Notifications() {
  const data = [
    { id: 1, text: 'Maria curtiu seu post', time: '2025-07-22 09:00' },
    { id: 2, text: 'Pedro comentou: “Boa!”', time: '2025-07-23 14:20' },
  ]

  return (
    <section>
      <h1>Notificações</h1>
      <ul className="list">
        {data.map(n => (
          <li key={n.id} className="card">
            {n.text}
            <small className="muted">{new Date(n.time).toLocaleString()}</small>
          </li>
        ))}
      </ul>
    </section>
  )
}
