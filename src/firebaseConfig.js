import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyC6EkR4L89mc1ISWmHxtUGnGWryZE_HqLs",
    authDomain: "kronos-902fe.firebaseapp.com",
    projectId: "kronos-902fe",
    storageBucket: "kronos-902fe.firebasestorage.app",
    messagingSenderId: "32717782296",
    appId: "1:32717782296:web:55a6705acda46d492cf26d",
    measurementId: "G-993NZ7FQRH"
  };


  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);
  
  export { auth, db };