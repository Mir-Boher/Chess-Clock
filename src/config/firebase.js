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
if (!firebase.apps || !firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const db = firebase.firestore();

window.auth = auth;
window.db = db;

if (!window.firebase) {
  console.error("Firebase SDK not loaded!");
}
