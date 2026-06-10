import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAc5wTvIcFBtsJViOezW1tPZi5RM_Rxo2c",
  authDomain: "gymtrack04.firebaseapp.com",
  projectId: "gymtrack04",
  storageBucket: "gymtrack04.firebasestorage.app",
  messagingSenderId: "316488501426",
  appId: "1:316488501426:web:6700e9bbd2761c120421ab",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;