import { create } from 'zustand';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';

const useAuth = create((set) => ({
  user: null,
  profileData: null,
  loading: true,

  fetchProfileData: async (uid) => {
    try {
      const docRef = doc(db, 'users', uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        set({ profileData: docSnap.data() });
      } else {
        set({ profileData: null });
      }
    } catch (error) {
      console.error('Erro ao buscar dados do perfil:', error);
      set({ profileData: null });
    }
  },

  updateProfilePicture: (newPhotoUrl) => {
    set((state) => ({
      profileData: {
        ...state.profileData,
        fotoURL: newPhotoUrl,
      },
    }));
  },

  initAuthListener: () => {
    onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        set({ user: currentUser, loading: true });
        await useAuth.getState().fetchProfileData(currentUser.uid);
        set({ loading: false });
      } else {
        set({ user: null, profileData: null, loading: false });
      }
    });
  },

  logout: async () => {
    await signOut(auth);
    set({ user: null, profileData: null });
  },
}));



useAuth.getState().initAuthListener();

export default useAuth;