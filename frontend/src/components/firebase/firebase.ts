import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBVIpzHSETzGNIVN7kj6kp4pGIbun_OqRU",
  authDomain: "moodify-1c59b.firebaseapp.com",
  projectId: "moodify-1c59b",
  storageBucket: "moodify-1c59b.appspot.com",
  messagingSenderId: "102165390463",
  appId: "1:102165390463:web:02c5ffb694692230063b6c",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
