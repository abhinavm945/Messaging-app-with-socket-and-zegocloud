import { initializeApp } from "firebase/app";
import {getAuth} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyB6nd7r7Rlu6fU7HaANWzROMrJKdb4U8qQ",
  authDomain: "whatsapp-clone-dc38a.firebaseapp.com",
  projectId: "whatsapp-clone-dc38a",
  storageBucket: "whatsapp-clone-dc38a.appspot.com",
  messagingSenderId: "398287726995",
  appId: "1:398287726995:web:946885e4f5a29a82656066",
  measurementId: "G-9RDYZR2PXE"
};

const app = initializeApp(firebaseConfig);
export const firebaseAuth = getAuth(app);