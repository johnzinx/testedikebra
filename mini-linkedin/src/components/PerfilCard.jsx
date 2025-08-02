export default function PerfilCard({ usuario }) {
  return (
    <div className="bg-white shadow-md p-6 rounded-xl">
      <h2 className="text-2xl font-bold mb-1">{usuario.nome}</h2>
      <p className="text-sm text-gray-500 mb-3">{usuario.email}</p>
      <p className="mb-4 text-gray-700">{usuario.bio || 'Sem bio'}</p>

      {/* Skills */}
      <div className="mb-4">
        <h3 className="font-semibold mb-1">Skills:</h3>
        <div className="flex flex-wrap gap-2">
          {usuario.skills?.length ? (
            usuario.skills.map((skill, i) => (
              <span key={i} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                {skill}
              </span>
            ))
          ) : (
            <p className="text-gray-500">Nenhuma skill listada</p>
          )}
        </div>
      </div>

      {/* Experiências */}
      <div>
        <h3 className="font-semibold mb-1">Experiências:</h3>
        {usuario.experiencias?.length ? (
          <ul className="space-y-1">
            {usuario.experiencias.map((exp, i) => (
              <li key={i} className="text-sm text-gray-700">
                <strong>{exp.cargo}</strong> em {exp.empresa} ({exp.inicio} - {exp.fim || 'Atual'})
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">Sem experiências</p>
        )}
      </div>
    </div>
  )
}
