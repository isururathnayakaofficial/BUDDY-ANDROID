import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";


const firebaseConfig = {
  apiKey: "AIzaSyD6exDMM8HSUVvi1B74eZFbIm0SPnM2vWA",
  authDomain: "amd-pro-c026e.firebaseapp.com",
  projectId: "amd-pro-c026e",
  storageBucket: "amd-pro-c026e.firebasestorage.app",
  messagingSenderId: "866189210649",
  appId: "1:866189210649:web:e79dee5057bb2cba29e688"
};


const app = initializeApp(firebaseConfig);

const firestore = getFirestore(app);
const firebaseAuth = getAuth(app);


export { firestore as db };
export { firebaseAuth as auth };