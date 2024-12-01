import { database, auth } from "../assets/js/firebase-config.js";
import { signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";

document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("login-form");

    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const email = document.getElementById("email").value;
            const password = document.getElementById("password").value;

            try {
                await signInWithEmailAndPassword(auth, email, password);
                alert("Login successful!");
                window.location.href = "../index.html"; // Redirect to the main page
            } catch (error) {
                alert("Login failed: " + error.message);
            }
        });
    }

    // Redirect if user is already logged in
    onAuthStateChanged(auth, (user) => {
        if (user) {
            window.location.href = "../index.html";
        }
    });
});
document.addEventListener("DOMContentLoaded", () => {
    const menuToggleButton = document.getElementById("menu-toggle");
    const sidebar = document.querySelector(".sidebar");
    const closeButton = document.createElement("button");

    // Create the close button dynamically
    closeButton.textContent = "Close";
    closeButton.classList.add("close-btn");
    sidebar.prepend(closeButton);

    // Toggle sidebar on menu button click
    menuToggleButton.addEventListener("click", () => {
        sidebar.classList.add("active");
    });

    // Close the sidebar on close button click
    closeButton.addEventListener("click", () => {
        sidebar.classList.remove("active");
    });
});

