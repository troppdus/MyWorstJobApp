import { initializeApp, getApp, getApps }
  from "https://www.gstatic.com/firebasejs/9.8.1/firebase-app.js";
import { getFirestore, connectFirestoreEmulator } from "https://www.gstatic.com/firebasejs/9.8.1/firebase-firestore.js";
import { getAuth, connectAuthEmulator }
  from "https://www.gstatic.com/firebasejs/9.8.1/firebase-auth.js";

// TODO: Replace the following with your web app's Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyBefv563sfb6c-dCGM1bFUk67fjv39Vo5c",
  authDomain: "myworstjobapp.firebaseapp.com",
  projectId: "myworstjobapp",
  storageBucket: "myworstjobapp.appspot.com",
  messagingSenderId: "709200212587",
  appId: "1:709200212587:web:a6ee7b914480400e27372e"
};

// Initialize a Firebase App object
// initializeApp( firebaseConfig);
// Initialize a Firebase App object only if not already initialized
const app = (!getApps().length) ? initializeApp( firebaseConfig ) : getApp();
// Initialize Cloud Firestore interface
const fsDb = getFirestore();

// Initialize a Firebase App object only if not already initialized
// const app = (!getApps().length) ? initializeApp( firebaseConfig ) : getApp();
// Initialize Firebase Authentication
const auth = getAuth( app);

if (window.location.hostname === "localhost") {
  // Point to the RTDB emulator running on localhost.
  connectFirestoreEmulator( fsDb, "localhost", 8080);
  // Point to the Auth emulator running on localhost.
  connectAuthEmulator( auth, "http://localhost:9099");
}



export { auth, fsDb };
