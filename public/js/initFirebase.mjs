import { initializeApp } from "https://www.gstatic.com/firebasejs/9.8.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.8.1/firebase-firestore-lite.js";

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
initializeApp( firebaseConfig);
// Initialize Cloud Firestore interface
const fsDb = getFirestore();

export { fsDb };