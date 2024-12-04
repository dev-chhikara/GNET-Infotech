// script.js
let recaptchaVerifier; // 

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyC2bLHi2CKsdI4w-_FNO01T8VSPidQMkeE",
    authDomain: "gnet-infotech.firebaseapp.com",
    databaseURL: "https://gnet-infotech-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "gnet-infotech",
    storageBucket: "gnet-infotech.firebasestorage.app",
    messagingSenderId: "134910654750",
    appId: "1:134910654750:web:faff248c0b9a1407d2f10f",
    measurementId: "G-LGMZJPLV9P"
};
  

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// DOM Elements
const loginForm = document.getElementById("login-form");
const otpSection = document.getElementById("otp-section");
const welcomeSection = document.getElementById("welcome");
const phoneInput = document.getElementById("phone");
const otpInput = document.getElementById("otp");
const sendOtpButton = document.getElementById("send-otp");
const verifyOtpButton = document.getElementById("verify-otp");
const logoutButton = document.getElementById("logout-btn");

// Check Login State
auth.onAuthStateChanged(user => {
  if (user) {
    loginForm.style.display = "none";
    welcomeSection.style.display = "block";
  } else {
    loginForm.style.display = "block";
    welcomeSection.style.display = "none";
  }
});

// Send OTP
sendOtpButton.addEventListener("click", () => {
  const phoneNumber = phoneInput.value;
  const appVerifier = new firebase.auth.RecaptchaVerifier("send-otp", {
    size: "invisible"
  });

  auth.signInWithPhoneNumber(phoneNumber, appVerifier)
    .then(confirmationResult => {
      window.confirmationResult = confirmationResult;
      otpSection.style.display = "block";
    })
    .catch(error => {
      alert(error.message);
    });
});

// Verify OTP
verifyOtpButton.addEventListener("click", () => {
  const code = otpInput.value;

  window.confirmationResult.confirm(code)
    .then(result => {
      const user = result.user;
      alert("Login successful!");
      loginForm.style.display = "none";
      welcomeSection.style.display = "block";
    })
    .catch(error => {
      alert("Invalid OTP!");
    });
});

// Logout
logoutButton.addEventListener("click", () => {
  auth.signOut();
});