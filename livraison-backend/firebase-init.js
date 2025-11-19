// config/firebase-config.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// التهيئة - نفس الإعدادات
const firebaseConfig = {
  apiKey: "AIzaSyB2gSvCF-b2uAZM9j-EQAYs6UKjbRmuxrM",
  authDomain: "livraison-express-f48c3.firebaseapp.com",
  projectId: "livraison-express-f48c3",
  storageBucket: "livraison-express-f48c3.firebasestorage.app",
  messagingSenderId: "1077573560587",
  appId: "1:1077573560587:web:c1a1ffb4cd36f60d605a0e"
};

// تهيئة Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db, app };