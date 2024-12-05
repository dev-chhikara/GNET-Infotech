import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js';
import {
    getAuth,
    setPersistence,
    browserLocalPersistence,
    RecaptchaVerifier,
    onAuthStateChanged,
    updateProfile,
    signInWithPhoneNumber,
    PhoneAuthProvider,
    signInWithCredential,
} from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js';
import { getDatabase, ref, get, set, child } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js';

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

// Initialize Auth and Database
const auth = getAuth(app);
const db = getDatabase(app);

setPersistence(auth, browserLocalPersistence);

// Show progress bar when checking login status
function checkUserLogin() {
    const progressBarContainer = document.getElementById('progress-bar-container');
    const progressBar = document.getElementById('progress-bar');

    // Show the progress bar
    progressBarContainer.style.display = 'block';

    // Listen to the authentication state change
    onAuthStateChanged(auth, (user) => {
        if (user) {
            // User is logged in
            console.log('User is logged in:', user);

            // Hide the progress bar after login check
            progressBarContainer.style.display = 'none';

            // Proceed with fetching user data or navigating to the user section
            fetchUserDetails(user);
        } else {
            // User is not logged in
            console.log('User is not logged in.');

            // Hide the progress bar after login check
            progressBarContainer.style.display = 'none';

            // Show login section or any other UI updates
            showLoginSection();
        }
    });
}

// Call the function to check user login status
checkUserLogin();


function fetchUserDetails(user) {
    const dbRef = ref(db);
    get(child(dbRef, `users/${user.uid}`))
        .then((snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                console.log('Fetched user data:', data);

                // Handle undefined or missing fields
                const name = data.name || user.displayName || 'User Name';
                const mobile = user.phoneNumber || 'N/A';
                const email = data.email || 'Not Provided';

                // Update the UI with fetched data
                document.getElementById('user-name').textContent = name;
                document.getElementById('user-mobile').textContent = mobile;
                document.getElementById('user-email').textContent = email;

                showUserSection();
            } else {
                console.log('No user data found in database.');
                const name = user.displayName || 'User Name';
                const mobile = user.phoneNumber || 'N/A';
                document.getElementById('user-name').textContent = name;
                document.getElementById('user-mobile').textContent = mobile;
                document.getElementById('user-email').textContent = 'Not Provided';
                showUserSection();
            }
        })
        .catch((error) => {
            console.error('Error fetching user data:', error);
        });
}


function showUserSection(user) {
    // Fetch user details from the database (if needed)
    const userName = user.displayName || 'User';
    const userEmail = user.email;

    document.getElementById('user-name').textContent = userName;
    document.getElementById('user-email').textContent = userEmail;

    // Show user details and hide login section
    document.getElementById('user-section').style.display = 'block';
    document.getElementById('login-section').style.display = 'none';
}

// Function to show login section
function showLoginSection() {
    document.getElementById('login-section').style.display = 'block';
    document.getElementById('user-section').style.display = 'none';
}

const loginSection = document.getElementById('login-section');
const userSection = document.getElementById('user-section');
const sendOtpBtn = document.getElementById('send-otp-btn');
const verifyOtpBtn = document.getElementById('verify-otp-btn');
const mobileInput = document.getElementById('mobile-input');
const otpSection = document.getElementById('otp-section');
const otpInput = document.getElementById('otp-input');
const logoutBtn = document.getElementById('logout-btn');
const resendOtpBtn = document.getElementById('resend-otp-btn');
const userName = document.getElementById('user-name'); // For user's name
const userMobile = document.getElementById('user-mobile'); // For user's mobile number
const userEmail = document.getElementById('user-email'); // For user's email
const editProfileBtn = document.getElementById('edit-profile-btn');
const editProfileModal = document.getElementById('edit-profile-modal');
const saveProfileBtn = document.getElementById('save-profile-btn');
const cancelEditBtn = document.getElementById('cancel-edit-btn');

editProfileBtn.addEventListener('click', () => {
    editProfileModal.style.display = 'block';
    document.getElementById('edit-name').value = document.getElementById('user-name').textContent;
    document.getElementById('edit-email').value = document.getElementById('user-email').textContent;
});

// Close modal without saving
cancelEditBtn.addEventListener('click', () => {
    editProfileModal.style.display = 'none';
});

// Save updated profile details
saveProfileBtn.addEventListener('click', () => {
    const updatedName = document.getElementById('edit-name').value;
    const updatedEmail = document.getElementById('edit-email').value;

    // Update details in Firebase Authentication
    const user = auth.currentUser;
    if (user) {
        updateProfile(user, {
            displayName: updatedName,
        })
            .then(() => {
                console.log('Profile updated in auth.');

                // Update only the name and email in the Realtime Database
                const userRef = ref(db, `users/${user.uid}`);
                update(userRef, {
                    name: updatedName,
                    email: updatedEmail, 
                })
                    .then(() => {
                        console.log('Profile updated in database.');
                        // Update UI with the new details
                        document.getElementById('user-name').textContent = updatedName;
                        document.getElementById('user-email').textContent = updatedEmail;
                        editProfileModal.style.display = 'none';
                    })
                    .catch((error) => {
                        console.error('Error updating profile in database:', error);
                    });
            })
            .catch((error) => {
                console.error('Error updating profile in auth:', error);
            });
    }
});

let recaptchaVerifier;
let confirmationResult;

let otpSentTime = null;
let resendTimeout = null;

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

                // Start the timer for the resend OTP button
                otpSentTime = Date.now();
                startResendTimer();
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

function startResendTimer() {
    sendOtpBtn.disabled = true; // Disable the send OTP button
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
            resendBtn.style.display = 'inline-block'; // Show resend OTP button
            sendOtpBtn.disabled = false; // Enable the send OTP button again
        } else {
            timerElement.textContent = `${remainingTime} seconds`;
        }
    }

    resendTimeout = setInterval(updateTimer, 1000); // Update every second
    updateTimer(); // Call immediately to show the initial timer
}

verifyOtpBtn.addEventListener('click', () => {
    const otpValue = otpInput.value;
    if (!otpValue) {
        alert('Please enter the OTP.');
        return;
    }

    confirmationResult.confirm(otpValue)
        .then(async (result) => {
            const user = result.user; // Firebase authenticated user
            console.log('User verified:', user);

            const userId = user.uid;
            const userRef = ref(db, `users/${userId}`);

            // Check if the user already exists in the database
            const snapshot = await get(userRef);
            if (!snapshot.exists()) {
                // Save user data to the database
                await set(userRef, {
                    name: 'New User',
                    phoneNumber: user.phoneNumber,
                    email: '',
                });
            }

            // Fetch user data to display
            const userData = snapshot.val() || { name: 'New User', phoneNumber: user.phoneNumber, email: '' };

            // Update UI
            userName.textContent = userData.name || 'No Name Provided';
            userMobile.textContent = userData.phoneNumber || 'No Mobile Number';
            userEmail.textContent = userData.email || 'No Email';

            loginSection.style.display = 'none';
            userSection.style.display = 'block';
        })
        .catch((error) => {
            console.error('Error verifying OTP:', error);
            alert('Failed to verify OTP. Please try again.');
        });
});


// Resend OTP
resendOtpBtn.addEventListener('click', () => {
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

                // Start the timer for the resend OTP button
                otpSentTime = Date.now();
                startResendTimer();
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
