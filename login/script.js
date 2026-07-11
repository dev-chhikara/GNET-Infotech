import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js';
import {
    getAuth,
    setPersistence,
    browserLocalPersistence,
    RecaptchaVerifier,
    onAuthStateChanged,
    updateProfile,
    signInWithPhoneNumber,
} from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js';
import { getDatabase, ref, get, update, set, child } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js';

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

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

setPersistence(auth, browserLocalPersistence);

function checkUserLogin() {
    const loader = document.getElementById('fullscreen-loader');
    const urlParams = new URLSearchParams(window.location.search);
    const checkoutId = urlParams.get('checkout');

    onAuthStateChanged(auth, (user) => {
        if (user) {
            if (loader) loader.classList.add('hidden');
            logoutBtn.style.display = 'inline-block';

            if (checkoutId) {
                window.location.href = `../buy-now.html?productid=${checkoutId}`;
            } else {
                fetchUserDetails(user);
            }
        } else {
            if (loader) loader.classList.add('hidden');
            logoutBtn.style.display = 'none';
            showLoginSection();
        }
    });
}

checkUserLogin();

function toggleLoading(isLoading) {
    const sendOtpBtn = document.getElementById('send-otp-btn');
    const verifyOtpBtn = document.getElementById('verify-otp-btn');
    const loadingSpinner = document.getElementById('loading-spinner');

    if (isLoading) {
        if(loadingSpinner) loadingSpinner.style.display = 'block';
        if(sendOtpBtn) sendOtpBtn.style.display = 'none';
        if(verifyOtpBtn) verifyOtpBtn.style.display = 'none';
    } else {
        if(loadingSpinner) loadingSpinner.style.display = 'none';
        if(sendOtpBtn) sendOtpBtn.style.display = 'block';
        if(verifyOtpBtn) verifyOtpBtn.style.display = 'block';
    }
}

function fetchUserDetails(user) {
    const dbRef = ref(db);
    get(child(dbRef, `users/${user.uid}`))
        .then((snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                const name = data.name || user.displayName || 'User Name';
                const mobile = user.phoneNumber || 'N/A';
                const email = data.email || 'Not Provided';

                document.getElementById('user-name').textContent = name;
                document.getElementById('user-mobile').textContent = mobile;
                document.getElementById('user-email').textContent = email;

                showUserSection();
            } else {
                const name = user.displayName || 'User Name';
                const mobile = user.phoneNumber || 'N/A';
                document.getElementById('user-name').textContent = name;
                document.getElementById('user-mobile').textContent = mobile;
                document.getElementById('user-email').textContent = 'Not Provided';
                showUserSection();
            }
        })
        .catch((error) => console.error(error));
}

function showUserSection() {
    document.getElementById('user-section').style.display = 'block';
    document.getElementById('login-section').style.display = 'none';
}

function showLoginSection() {
    document.getElementById('login-section').style.display = 'block';
    document.getElementById('user-section').style.display = 'none';
}

// Global DOM Variables
const loginSection = document.getElementById('login-section');
const userSection = document.getElementById('user-section');
const mobileInputSection = document.getElementById('mobile-input-section'); // New Container
const loginSubtitle = document.getElementById('login-subtitle'); // Subtitle
const otpSentMessage = document.getElementById('otp-sent-message'); // Dynamic Message
const sendOtpBtn = document.getElementById('send-otp-btn');
const verifyOtpBtn = document.getElementById('verify-otp-btn');
const mobileInput = document.getElementById('mobile-input');
const otpSection = document.getElementById('otp-section');
const otpInput = document.getElementById('otp-input');
const logoutBtn = document.getElementById('logout-btn');
const resendOtpBtn = document.getElementById('resend-otp-btn');
const userName = document.getElementById('user-name'); 
const userMobile = document.getElementById('user-mobile'); 
const userEmail = document.getElementById('user-email'); 
const editProfileBtn = document.getElementById('edit-profile-btn');
const editProfileModal = document.getElementById('edit-profile-modal');
const saveProfileBtn = document.getElementById('save-profile-btn');
const cancelEditBtn = document.getElementById('cancel-edit-btn');

editProfileBtn.addEventListener('click', () => {
    editProfileModal.style.display = 'flex'; 
    document.getElementById('edit-name').value = document.getElementById('user-name').textContent;
    document.getElementById('edit-email').value = document.getElementById('user-email').textContent;
});

cancelEditBtn.addEventListener('click', () => {
    editProfileModal.style.display = 'none';
});

saveProfileBtn.addEventListener('click', () => {
    const updatedName = document.getElementById('edit-name').value;
    const updatedEmail = document.getElementById('edit-email').value;

    const user = auth.currentUser;
    if (user) {
        updateProfile(user, { displayName: updatedName })
        .then(() => {
            const userRef = ref(db, `users/${user.uid}`);
            update(userRef, { name: updatedName, email: updatedEmail })
            .then(() => {
                document.getElementById('user-name').textContent = updatedName;
                document.getElementById('user-email').textContent = updatedEmail;
                editProfileModal.style.display = 'none';
            })
            .catch((error) => console.error(error));
        })
        .catch((error) => console.error(error));
    }
});

let recaptchaVerifier;
let confirmationResult;
let otpSentTime = null;
let resendTimeout = null;

function resetRecaptcha() {
    if (recaptchaVerifier) recaptchaVerifier.clear();
    recaptchaVerifier = new RecaptchaVerifier('recaptcha-container', {
        size: 'invisible',
        callback: () => {},
        'expired-callback': () => resetRecaptcha(),
    }, auth);
    recaptchaVerifier.render();
}

// ---------------- SEND OTP FIX ----------------
sendOtpBtn.addEventListener('click', () => {
    const phoneNumber = `+91${mobileInput.value}`;
    if (!phoneNumber || phoneNumber.length !== 13) {
        alert("Please enter a valid 10-digit phone number");
        return;
    }
    
    toggleLoading(true);
    resetRecaptcha(); 

    recaptchaVerifier.verify().then(() => {
        signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier)
            .then((result) => {
                confirmationResult = result;
                
                // Hide the loader, input, and subtitle
                toggleLoading(false);
                mobileInputSection.style.display = 'none';
                loginSubtitle.style.display = 'none';
                
                // Show dynamic success message and OTP field
                otpSentMessage.textContent = `OTP successfully sent to ${phoneNumber}`;
                otpSentMessage.style.display = 'block';
                otpSection.style.display = 'block';
                
                otpSentTime = Date.now();
                startResendTimer();
            })
            .catch((error) => {
                toggleLoading(false);
                alert("Failed to send OTP. Please try again.");
            });
    }).catch((error) => {
        toggleLoading(false);
        alert("reCAPTCHA verification failed.");
    });
});

function startResendTimer() {
    const timerElement = document.getElementById('timer');
    const resendBtn = document.getElementById('resend-otp-btn');
    const timerSection = document.getElementById('timer-section');

    resendBtn.style.display = 'none';
    timerSection.style.display = 'block';

    function updateTimer() {
        const remainingTime = 30 - Math.floor((Date.now() - otpSentTime) / 1000);
        if (remainingTime <= 0) {
            clearInterval(resendTimeout);
            timerSection.style.display = 'none';
            resendBtn.style.display = 'inline-block'; 
        } else {
            timerElement.textContent = `${remainingTime} seconds`;
        }
    }

    resendTimeout = setInterval(updateTimer, 1000); 
    updateTimer(); 
}

// ---------------- VERIFY OTP FIX ----------------
verifyOtpBtn.addEventListener('click', () => {
    const otpValue = otpInput.value;
    if (!otpValue) {
        alert('Please enter the OTP.');
        return;
    }

    toggleLoading(true);

    confirmationResult.confirm(otpValue)
        .then(async (result) => {
            const user = result.user; 
            const userId = user.uid;
            const userRef = ref(db, `users/${userId}`);

            const snapshot = await get(userRef);
            if (!snapshot.exists()) {
                await set(userRef, {
                    name: 'New User',
                    phoneNumber: user.phoneNumber,
                    email: '',
                });
            }

            const userData = snapshot.val() || { name: 'New User', phoneNumber: user.phoneNumber, email: '' };

            userName.textContent = userData.name || 'No Name Provided';
            userMobile.textContent = userData.phoneNumber || 'No Mobile Number';
            userEmail.textContent = userData.email || 'No Email';

            toggleLoading(false);
            loginSection.style.display = 'none';
            userSection.style.display = 'block';
        })
        .catch(() => {
            toggleLoading(false);
            alert('Failed to verify OTP. Please try again or resend.');
        });
});

resendOtpBtn.addEventListener('click', () => {
    const phoneNumber = `+91${mobileInput.value}`;
    if (!phoneNumber || phoneNumber.length !== 13) {
        alert("Please enter a valid phone number");
        return;
    }

    toggleLoading(true);
    resetRecaptcha(); 
    
    recaptchaVerifier.verify().then(() => {
        signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier)
            .then((result) => {
                confirmationResult = result;
                
                toggleLoading(false);
                otpSentMessage.textContent = `OTP successfully re-sent to ${phoneNumber}`;
                otpSentTime = Date.now();
                startResendTimer();
            })
            .catch((error) => {
                toggleLoading(false);
                alert("Failed to send OTP. Please try again.");
            });
    }).catch((error) => {
        toggleLoading(false);
        alert("reCAPTCHA verification failed.");
    });
});

logoutBtn.addEventListener('click', () => {
    auth.signOut().then(() => {
        loginSection.style.display = 'block';
        userSection.style.display = 'none';
        location.reload();
    }).catch(() => alert("Failed to logout. Please try again."));
});