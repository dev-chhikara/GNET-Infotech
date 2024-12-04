import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js';
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber, PhoneAuthProvider, signInWithCredential } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js';
import { getDatabase, ref, get, set } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js'; // Realtime Database imports

const firebaseConfig = {
  apiKey: "AIzaSyC2bLHi2CKsdI4w-_FNO01T8VSPidQMkeE",
  authDomain: "gnet-infotech.firebaseapp.com",
  databaseURL: "https://gnet-infotech-default-rtdb.asia-southeast1.firebasedatabase.app", // Realtime Database URL
  projectId: "gnet-infotech",
  storageBucket: "gnet-infotech.firebasestorage.app",
  messagingSenderId: "134910654750",
  appId: "1:134910654750:web:faff248c0b9a1407d2f10f",
  measurementId: "G-LGMZJPLV9P"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app); // Initialize Realtime Database

// DOM Elements
const loginSection = document.getElementById('login-section');
const userSection = document.getElementById('user-section');
const sendOtpBtn = document.getElementById('send-otp-btn');
const verifyOtpBtn = document.getElementById('verify-otp-btn');
const mobileInput = document.getElementById('mobile-input');
const otpSection = document.getElementById('otp-section');
const otpInput = document.getElementById('otp-input');
let confirmationResult; // Declare confirmationResult globally

// Send OTP
sendOtpBtn.addEventListener('click', async () => {
  const phoneNumber = `+91${mobileInput.value}`;

  // Show the loading spinner while sending OTP
  document.getElementById('loading-spinner').style.display = 'block';
  sendOtpBtn.disabled = true; // Disable the button to prevent multiple clicks

  // Ensure Recaptcha is rendered inside the 'recaptcha-container'
  const appVerifier = new RecaptchaVerifier('recaptcha-container', { size: 'invisible' }, auth);
  appVerifier.render().then(function() {
    console.log("reCAPTCHA rendered successfully");
    signInWithPhoneNumber(auth, phoneNumber, appVerifier)
      .then((result) => {
        console.log("OTP sent successfully:", result);
        confirmationResult = result;
      })
      .catch((error) => {
        console.error("Error sending OTP:", error);
      });
  }).catch(function (error) {
    console.error("Error rendering reCAPTCHA:", error);
  });

  // Render the reCAPTCHA widget
  appVerifier.render().then(function () {
    // When the widget is rendered, trigger the OTP request
    signInWithPhoneNumber(auth, phoneNumber, appVerifier)
      .then(function (result) {
        confirmationResult = result; // Store confirmationResult here
        otpSection.style.display = 'block';  // Show OTP input

        // Hide the loading spinner after OTP is sent
        document.getElementById('loading-spinner').style.display = 'none';
        sendOtpBtn.disabled = false; // Re-enable the button
      })
      .catch(function (error) {
        console.error("Error sending OTP:", error);

        // Hide the loading spinner in case of error
        document.getElementById('loading-spinner').style.display = 'none';
        sendOtpBtn.disabled = false; // Re-enable the button
      });
  }).catch(function (error) {
    console.error("Error rendering reCAPTCHA:", error);

    // Hide the loading spinner in case of error
    document.getElementById('loading-spinner').style.display = 'none';
    sendOtpBtn.disabled = false; // Re-enable the button
  });
});

// Verify OTP
verifyOtpBtn.addEventListener('click', async () => {
  const otp = otpInput.value;

  try {
    if (!confirmationResult) {
      console.error("No confirmation result available.");
      return;
    }

    // Show loading spinner while verifying OTP
    document.getElementById('loading-spinner').style.display = 'block';
    verifyOtpBtn.disabled = true; // Disable the button

    // Create credential using the verificationId and OTP
    const credential = PhoneAuthProvider.credential(confirmationResult.verificationId, otp);
    const userCredential = await signInWithCredential(auth, credential);
    const user = userCredential.user;

    // Reference to Realtime Database user node
    const userRef = ref(db, 'users/' + user.uid); // Use Realtime Database path
    const snapshot = await get(userRef);

    if (!snapshot.exists()) {
      // If user doesn't exist, create new node in Realtime Database
      await set(userRef, {
        name: "Name",
        email: "Email",
        mobile: user.phoneNumber,
      });
    }

    // Hide loading spinner and show user section
    document.getElementById('loading-spinner').style.display = 'none';
    verifyOtpBtn.disabled = false; // Re-enable the button

    loginSection.style.display = 'none';
    userSection.style.display = 'block';

    // Populate user data
    const userData = snapshot.val(); // Get data from snapshot
    document.getElementById('user-name').textContent = userData.name;
    document.getElementById('user-mobile').textContent = userData.mobile;
    document.getElementById('user-email').textContent = userData.email;

  } catch (error) {
    console.error("Error verifying OTP:", error);

    // Hide the loading spinner if an error occurs
    document.getElementById('loading-spinner').style.display = 'none';
    verifyOtpBtn.disabled = false; // Re-enable the button
  }
});
