// Importa só o que vamos usar (modular, otimizado)
import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"
import { getAnalytics } from "firebase/analytics"

// Config do seu projeto (pega no console do Firebase)
const firebaseConfig = {
  apiKey: "AIzaSyBTxKC6WE2M89ghPpofbJzgSHlmV5tyPq0",
  authDomain: "dikebra-5ee99.firebaseapp.com",
  projectId: "dikebra-5ee99",
  storageBucket: "dikebra-5ee99.appspot.com",
  messagingSenderId: "939771964253",
  appId: "1:939771964253:web:8b07e41da35bb051bf96b4",
  measurementId: "G-0QPNZYTTQQ",
}

// Inicializa o Firebase
const app = initializeApp(firebaseConfig)

// (Opcional) Analytics, só se quiser usar
const analytics = getAnalytics(app)

// Exporta os serviços que vamos usar no app
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)
