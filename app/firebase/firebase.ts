import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage"; // Import Firebase Storage

//  web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC7i_t4rS2FvR9nhdT8_IufVK2Xy4rvx8c",
  authDomain: "jobtracker-3b3a9.firebaseapp.com",
  projectId: "jobtracker-3b3a9",
  storageBucket: "jobtracker-3b3a9.appspot.com",
  messagingSenderId: "469255399942",
  appId: "1:469255399942:web:eab06b2ccb14f20558b187",
  measurementId: "G-M1BHZ6QY55"
};


// Initializing Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app); // Initialize Firebase Storage
if (storage) {
  console.log(true);
} else {
  console.log(false);
}
export const auth = getAuth(app);


// }
export { db, storage,}; // Export Firestore and Storage
