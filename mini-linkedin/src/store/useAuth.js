import { create } from 'zustand'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { auth } from '../services/firebase'

const useAuth = create((set) => ({
  user: null,
  loading: true,

  setUser: (user) => set({ user, loading: false }),

  logout: async () => {
    await signOut(auth)
    set({ user: null })
  },
}))

// Listener global (só precisa ser chamado uma vez no app)
onAuthStateChanged(auth, (user) => {
  useAuth.getState().setUser(user)
})

export default useAuth
