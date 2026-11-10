// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDTuDIbgEx8sLDMmoXWHPOCZ-3eaV0SjkA",
  authDomain: "app-inscricao-egn.firebaseapp.com",
  projectId: "app-inscricao-egn",
  storageBucket: "app-inscricao-egn.firebasestorage.app",
  messagingSenderId: "442088838058",
  appId: "1:442088838058:web:cc43ae00527605919c11d3",
  measurementId: "G-15NPKX9WLQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Analytics only works in the browser
let analytics;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

export { app, analytics, db };
