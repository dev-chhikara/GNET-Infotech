import { auth } from "./firebase-config.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/9.18.0/firebase-auth.js";

// Show notification at the bottom of the screen
function showNotification(message) {
  let notification = document.getElementById('auth-notification');
  if (!notification) {
    notification = document.createElement('div');
    notification.id = 'auth-notification';
    notification.style.position = 'fixed';
    notification.style.bottom = '0';
    notification.style.left = '0';
    notification.style.width = '100%';
    notification.style.backgroundColor = '#ffffff'; // White background
    notification.style.color = '#000000'; // Black text
    notification.style.padding = '10px 20px';
    notification.style.fontSize = '16px';
    notification.style.textAlign = 'center';
    notification.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.2)';
    notification.style.zIndex = '9999';
    document.body.appendChild(notification);
  }

  notification.innerHTML = message;
  setTimeout(() => {
    notification.style.transition = 'opacity 0.5s ease-out';
    notification.style.opacity = '0';
    setTimeout(() => {
      notification.remove();
    }, 500);
  }, 3000); // Show for 3 seconds
}

// Function to handle authentication (either login or register)
window.handleAuthAction = function() {
  const email = document.getElementById("email-input").value;
  const password = document.getElementById("password-input").value;

  if (!email || !password) {
    alert("Please enter both email and password.");
    return;
  }

  // Try signing in first to check if the user exists
  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // If sign-in is successful, the user exists, so log them in
      const user = userCredential.user;
      showNotification(`Welcome back, ${user.email}!`);
      closeLoginDialog(); // Close the login dialog
    })
    .catch((error) => {
      // If login fails with "user not found", proceed to register
      if (error.code === "auth/user-not-found") {
        registerUser(email, password);
      } else {
        console.error("Error during login:", error.message);
        showNotification(`Login failed: ${error.message}`);
      }
    });
};

// Function to register the user
function registerUser(email, password) {
  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      showNotification(`Welcome, ${user.email}! Your account has been created.`);
      closeLoginDialog(); // Close the login dialog
    })
    .catch((error) => {
      console.error("Error during registration:", error.message);
      showNotification(`Registration failed: ${error.message}`);
    });
}

// Function to prompt login/signup dialog
window.promptLogin = function() {
  document.body.insertAdjacentHTML(
    "beforeend",
    `
    <div id="login-dialog" class="dialog-overlay">
      <div class="dialog-content">
        <h3>Login or Sign Up</h3>
        <form id="auth-form">
          <div class="form-group">
            <input type="email" id="email-input" placeholder="Enter email" required />
          </div>
          <div class="form-group">
            <input type="password" id="password-input" placeholder="Enter password" required />
          </div>
          <button type="button" onclick="handleAuthAction()" class="auth-button">Login</button>
        </form>
        <button onclick="closeLoginDialog()" class="close-dialog">Close</button>
      </div>
    </div>
    `
  );
};

// Function to close the login dialog
window.closeLoginDialog = function() {
  const dialog = document.getElementById("login-dialog");
  if (dialog) dialog.remove();
};

// Function to check login status
export function checkLoginStatus() {
  const dialogBox = document.getElementById("dialog-box");
  onAuthStateChanged(auth, (user) => {
    if (user) {
      // User is logged in
      dialogBox.innerHTML = `
        <div class="dialog-item" onclick="openCart()">View Cart</div>
        <div class="dialog-item">Account</div>
        <div class="dialog-item" onclick="logout()">Logout</div>
      `;
    } else {
      // User is not logged in
      dialogBox.innerHTML = `
        <button class="dialog-button" onclick="promptLogin()">Login / Create Account</button>
      `;
    }
    dialogBox.classList.toggle("hidden");
  });
}

// Function to log out
export function logout() {
  signOut(auth)
    .then(() => {
      showNotification("You have logged out.");
      checkLoginStatus();
    })
    .catch((error) => {
      console.error("Logout failed:", error.message);
    });
}
window.logout = logout;