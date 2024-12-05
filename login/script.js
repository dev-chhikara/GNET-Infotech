import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js';
import {
    getAuth,
    RecaptchaVerifier,
    signInWithPhoneNumber,
    PhoneAuthProvider,
    signInWithCredential,
} from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js';
import { initializeFirestore, doc, getDoc, setDoc } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js';

const firebaseConfig = {
    apiKey: "AIzaSyC2bLHi2CKsdI4w-_FNO01T8VSPidQMkeE",
    authDomain: "gnet-infotech.firebaseapp.com",
    databaseURL: "https://gnet-infotech-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "gnet-infotech",
    storageBucket: "gnet-infotech.appspot.com",
    messagingSenderId: "134910654750",
    appId: "1:134910654750:web:faff248c0b9a1407d2f10f",
    measurementId: "G-LGMZJPLV9P",
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firestore with experimental settings for better network compatibility
const db = initializeFirestore(app, {
    experimentalForceLongPolling: true,
    useFetchStreams: false,
});

// Initialize Auth
const auth = getAuth(app);

const loginSection = document.getElementById('login-section');
const userSection = document.getElementById('user-section');
const sendOtpBtn = document.getElementById('send-otp-btn');
const verifyOtpBtn = document.getElementById('verify-otp-btn');
const mobileInput = document.getElementById('mobile-input');
const otpSection = document.getElementById('otp-section');
const otpInput = document.getElementById('otp-input');
const logoutBtn = document.getElementById('logout-btn');

let recaptchaVerifier;
let confirmationResult;

// Initialize reCAPTCHA
function resetRecaptcha() {
    if (recaptchaVerifier) {
        recaptchaVerifier.clear();
    }
    recaptchaVerifier = new RecaptchaVerifier(
        'recaptcha-container',
        {
            size: 'invisible',
            callback: () => {
                console.log('reCAPTCHA solved');
            },
            'expired-callback': () => {
                console.log('reCAPTCHA expired; resetting.');
                resetRecaptcha();
            },
        },
        auth
    );
    recaptchaVerifier.render();
}

// Send OTP
sendOtpBtn.addEventListener('click', () => {
    const phoneNumber = `+91${mobileInput.value}`;
    if (!phoneNumber || phoneNumber.length !== 13) {
        alert("Please enter a valid phone number");
        return;
    }

    resetRecaptcha(); // Reset reCAPTCHA before every OTP attempt
    recaptchaVerifier.verify().then(() => {
        signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier)
            .then((result) => {
                confirmationResult = result;
                otpSection.style.display = 'block';
            })
            .catch((error) => {
                console.error("Error sending OTP:", error);
                alert("Failed to send OTP. Please try again.");
            });
    }).catch((error) => {
        console.error("reCAPTCHA error:", error);
        alert("reCAPTCHA verification failed.");
    });
});

// Verify OTP
verifyOtpBtn.addEventListener('click', async () => {
    const otp = otpInput.value;
    if (!otp || otp.length !== 6) {
        alert("Please enter a valid 6-digit OTP");
        return;
    }

    try {
        const credential = PhoneAuthProvider.credential(confirmationResult.verificationId, otp);
        const userCredential = await signInWithCredential(auth, credential);
        const user = userCredential.user;

        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);
        if (!userDoc.exists()) {
            await setDoc(userRef, { name: "New User", email: "", mobile: user.phoneNumber });
        }

        const userData = (await getDoc(userRef)).data();
        document.getElementById('user-name').textContent = userData.name;
        document.getElementById('user-mobile').textContent = userData.mobile;
        document.getElementById('user-email').textContent = userData.email;

        loginSection.style.display = 'none';
        userSection.style.display = 'block';
    } catch (error) {
        console.error("Error verifying OTP:", error);
        alert("Invalid OTP. Please try again.");
    }
});

// Logout
logoutBtn.addEventListener('click', () => {
    auth.signOut().then(() => {
        loginSection.style.display = 'block';
        userSection.style.display = 'none';
    }).catch((error) => {
        console.error("Error logging out:", error);
        alert("Failed to logout. Please try again.");
    });
});
