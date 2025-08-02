import { mockJobs } from '../api/mock'

export default function Jobs() {
  return (
    <section>
      <h1>Vagas</h1>
      {mockJobs.map(job => (
        <div key={job.id} className="card">
          <h3>{job.title}</h3>
          <p className="muted">{job.company} • {job.location}</p>
          <small>Publicada em {new Date(job.postedAt).toLocaleDateString()}</small>
          <div style={{ marginTop: 8 }}>
            <button className="btn primary">Candidatar-se</button>
            <button className="btn outline">Salvar</button>
          </div>
        </div>
      ))}
    </section>
  )
}
