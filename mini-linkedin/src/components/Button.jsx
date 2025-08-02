// Button.jsx
export default function Button({ children, onClick, variant = 'primary', className = '' }) {
  const base =
    'px-5 py-2 rounded-lg font-semibold transition focus:outline-none focus:ring-2 focus:ring-offset-1'

  const variants = {
    primary: 'bg-primary text-white hover:bg-primary-dark focus:ring-primary',
    secondary: 'bg-gray-200 text-gray-700 hover:bg-gray-300 focus:ring-gray-400',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  }

  return (
    <button onClick={onClick} className={`${base} ${variants[variant]} ${className}`}>
      {children}
    </button>
  )
}
