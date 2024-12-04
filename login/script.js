import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js';
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber, PhoneAuthProvider, signInWithCredential } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js';
import { getFirestore, doc, getDoc, setDoc } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js';

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
const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);

    // DOM Elements
    const loginSection = document.getElementById('login-section');
    const userSection = document.getElementById('user-section');
    const sendOtpBtn = document.getElementById('send-otp-btn');
    const verifyOtpBtn = document.getElementById('verify-otp-btn');
    const mobileInput = document.getElementById('mobile-input');
    const otpSection = document.getElementById('otp-section');
    const otpInput = document.getElementById('otp-input');
    
    let confirmationResult;

    // Send OTP
    sendOtpBtn.addEventListener('click', async () => {
      const phoneNumber = `+91${mobileInput.value}`;
    
      // Ensure Recaptcha is rendered inside the 'recaptcha-container'
      const appVerifier = new RecaptchaVerifier('recaptcha-container', {
        size: 'invisible', // Or 'normal' to show the reCAPTCHA widget
      }, auth);
    
      // Render the reCAPTCHA widget
      appVerifier.render().then(function() {
        // When the widget is rendered, trigger the OTP request
        signInWithPhoneNumber(auth, phoneNumber, appVerifier)
          .then(function(confirmationResult) {
            // Successfully sent OTP
            confirmationResult = confirmationResult;
            otpSection.style.display = 'block';  // Show OTP input
          })
          .catch(function(error) {
            console.error("Error sending OTP:", error);
          });
      }).catch(function(error) {
        console.error("Error rendering reCAPTCHA:", error);
      });
    });
    

    // Verify OTP
    verifyOtpBtn.addEventListener('click', async () => {
      const otp = otpInput.value;

      try {
        const credential = PhoneAuthProvider.credential(confirmationResult.verificationId, otp);
        const userCredential = await signInWithCredential(auth, credential);
        const user = userCredential.user;

        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);

        if (!userDoc.exists()) {
          await setDoc(userRef, {
            name: "Name",
            email: "Email",
            mobile: user.phoneNumber,
          });
        }

        loginSection.style.display = 'none';
        userSection.style.display = 'block';

        // Populate user data
        const userData = (await getDoc(userRef)).data();
        document.getElementById('user-name').textContent = userData.name;
        document.getElementById('user-mobile').textContent = userData.mobile;
        document.getElementById('user-email').textContent = userData.email;

      } catch (error) {
        console.error("Error verifying OTP:", error);
      }
    });