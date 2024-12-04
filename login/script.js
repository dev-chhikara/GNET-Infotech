import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js';
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber, PhoneAuthProvider, signInWithCredential, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js';
import { getDatabase, ref, get, child, set } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js';

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
const db = getDatabase(app);

// DOM Elements
const loginSection = document.getElementById('login-section');
const userSection = document.getElementById('user-section');
const sendOtpBtn = document.getElementById('send-otp-btn');
const verifyOtpBtn = document.getElementById('verify-otp-btn');
const mobileInput = document.getElementById('mobile-input');
const otpSection = document.getElementById('otp-section');
const otpInput = document.getElementById('otp-input');
const logoutBtn = document.getElementById('logout-btn');
const editProfileBtn = document.getElementById('edit-profile-btn');
const editProfileModal = document.getElementById('edit-profile-modal');
const saveProfileBtn = document.getElementById('save-profile-btn');
const cancelEditBtn = document.getElementById('cancel-edit-btn');

let confirmationResult; // Declare confirmationResult globally

// Listen for authentication state changes
onAuthStateChanged(auth, (user) => {
  if (user) {
    // User is logged in
    loginSection.style.display = 'none';
    userSection.style.display = 'block';

    // Set user details
    document.getElementById('user-name').textContent = user.displayName || "User Name";
    document.getElementById('user-mobile').textContent = user.phoneNumber;
    document.getElementById('user-email').textContent = user.email || "Not provided";

    // Fetch user orders and cart (simulated)
    getUserOrders(user.uid);
  } else {
    // User is logged out
    loginSection.style.display = 'block';
    userSection.style.display = 'none';
  }
});

// Logout functionality
logoutBtn.addEventListener('click', () => {
  signOut(auth)
    .then(() => {
      console.log("User logged out successfully");
    })
    .catch((error) => {
      console.error("Error logging out", error);
    });
});

// Fetch orders
function getUserOrders(userId) {
  const ordersRef = ref(db, 'orders/' + userId);
  get(ordersRef).then((snapshot) => {
    if (snapshot.exists()) {
      // Display orders
      const orders = snapshot.val();
      const ordersList = document.getElementById('orders-list');
      ordersList.innerHTML = '';
      for (let orderId in orders) {
        const order = orders[orderId];
        const orderDiv = document.createElement('div');
        orderDiv.innerHTML = `<p>Order: ${order.productName}</p>`;
        ordersList.appendChild(orderDiv);
      }
    } else {
      console.log("No orders available.");
    }
  });
}

// Edit profile functionality
editProfileBtn.addEventListener('click', () => {
  // Populate the modal with current data
  const currentName = document.getElementById('user-name').textContent;
  const currentEmail = document.getElementById('user-email').textContent;
  const currentMobile = document.getElementById('user-mobile').textContent;

  document.getElementById('edit-name').value = currentName;
  document.getElementById('edit-email').value = currentEmail;
  document.getElementById('edit-mobile').value = currentMobile;

  editProfileModal.style.display = 'flex';
});

// Save profile changes
saveProfileBtn.addEventListener('click', () => {
  const newName = document.getElementById('edit-name').value;
  const newEmail = document.getElementById('edit-email').value;
  const newMobile = document.getElementById('edit-mobile').value;

  const user = auth.currentUser;
  if (user) {
    // Update Firebase Realtime Database with new info
    set(ref(db, 'users/' + user.uid), {
      name: newName,
      email: newEmail,
      mobile: newMobile
    }).then(() => {
      document.getElementById('user-name').textContent = newName;
      document.getElementById('user-email').textContent = newEmail;
      document.getElementById('user-mobile').textContent = newMobile;
      editProfileModal.style.display = 'none';
    }).catch((error) => {
      console.error("Error updating profile", error);
    });
  }
});

// Cancel profile editing
cancelEditBtn.addEventListener('click', () => {
  editProfileModal.style.display = 'none';
});
