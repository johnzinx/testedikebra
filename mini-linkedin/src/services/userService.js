import { doc, setDoc } from 'firebase/firestore'
import { db } from './firebase'

export async function criarOuAtualizarUser(user) {
  if (!user) return
  const userRef = doc(db, 'users', user.uid)
  await setDoc(userRef, {
    nome: user.displayName,
    email: user.email,
    bio: 'topzera', // valor padrão 
    skills: [],
    experiencias: []
  }, { merge: true }) // merge:true para não apagar dados existentes
}
