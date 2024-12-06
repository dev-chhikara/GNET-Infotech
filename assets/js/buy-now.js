import { auth } from "./firebase-config.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/9.18.0/firebase-auth.js";

export function checkLoginStatus() {
    const dialogBox = document.getElementById("dialog-box");
    onAuthStateChanged(auth, (user) => {
      if (user) {
        
      } else {
        window.location.href = `/login`;
        
      }
      dialogBox.classList.toggle("hidden");
    });
  }

  checkLoginStatus();