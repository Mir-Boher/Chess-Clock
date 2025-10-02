// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

const firebaseConfig = {
  apiKey: "AIzaSyAqFa4YGNBA9ETE31smiNcFEyAtOWXU77c",
  authDomain: "chess-clock-5a4ba.firebaseapp.com",
  databaseURL: "https://chess-clock-5a4ba-default-rtdb.firebaseio.com",
  projectId: "chess-clock-5a4ba",
  storageBucket: "chess-clock-5a4ba.firebasestorage.app",
  messagingSenderId: "640318905691",
  appId: "1:640318905691:web:fe86f926d1cd37c879ce7e",
  measurementId: "G-S11Z7850NB",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = firebase.firestore();

export const auth = getAuth(app);
