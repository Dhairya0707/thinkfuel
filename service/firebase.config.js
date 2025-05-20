// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCX4KJp2F3ikIKYw-O3rN2WVjK3lXJdx74",
  authDomain: "thinkfuel-4968e.firebaseapp.com",
  projectId: "thinkfuel-4968e",
  storageBucket: "thinkfuel-4968e.firebasestorage.app",
  messagingSenderId: "755236407666",
  appId: "1:755236407666:web:6260fb9285043b0468b5eb",
  measurementId: "G-4E0K62BBPL",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
