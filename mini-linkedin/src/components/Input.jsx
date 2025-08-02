// Input.jsx
export default function Input({ label, type = 'text', value, onChange, placeholder }) {
  return (
    <label className="block mb-5">
      <span className="text-gray-700 font-semibold mb-1 block">{label}</span>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2
                   placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
      />
    </label>
  )
}
