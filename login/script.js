import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js';
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber, PhoneAuthProvider, signInWithCredential } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js';
import { getFirestore, doc, getDoc, setDoc, collection, getDocs } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js';

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

const loginSection = document.getElementById('login-section');
const userSection = document.getElementById('user-section');
const sendOtpBtn = document.getElementById('send-otp-btn');
const verifyOtpBtn = document.getElementById('verify-otp-btn');
const mobileInput = document.getElementById('mobile-input');
const otpSection = document.getElementById('otp-section');
const otpInput = document.getElementById('otp-input');
const logoutBtn = document.getElementById('logout-btn');
const ordersList = document.getElementById('orders-list');
const cartList = document.getElementById('cart-list');

let confirmationResult;

sendOtpBtn.addEventListener('click', async () => {
    const phoneNumber = `+91${mobileInput.value}`;
    document.getElementById('loading-spinner').style.display = 'block';
    sendOtpBtn.disabled = true;

    const appVerifier = new RecaptchaVerifier('recaptcha-container', { size: 'invisible' }, auth);
    appVerifier.render().then(function () {
        signInWithPhoneNumber(auth, phoneNumber, appVerifier)
            .then((result) => {
                confirmationResult = result;
                otpSection.style.display = 'block';
                document.getElementById('loading-spinner').style.display = 'none';
                sendOtpBtn.disabled = false;
            })
            .catch((error) => {
                console.error("Error sending OTP:", error);
                document.getElementById('loading-spinner').style.display = 'none';
                sendOtpBtn.disabled = false;
            });
    });
});

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

        const userData = (await getDoc(userRef)).data();
        document.getElementById('user-name').textContent = userData.name;
        document.getElementById('user-mobile').textContent = userData.mobile;
        document.getElementById('user-email').textContent = userData.email;

        loginSection.style.display = 'none';
        userSection.style.display = 'block';

        loadOrders(user.uid);
        loadCart(user.uid);
    } catch (error) {
        console.error("Error verifying OTP:", error);
        document.getElementById('loading-spinner').style.display = 'none';
        verifyOtpBtn.disabled = false;
    }
});

logoutBtn.addEventListener('click', () => {
    auth.signOut().then(() => {
        loginSection.style.display = 'block';
        userSection.style.display = 'none';
    });
});

async function loadOrders(userId) {
    const ordersRef = doc(db, 'users', userId);
    const ordersDoc = await getDoc(ordersRef);
    const orderIds = ordersDoc.data().orders.split(',');

    for (const orderId of orderIds) {
        const orderRef = doc(db, 'OrderDetails', orderId);
        const orderDoc = await getDoc(orderRef);
        const orderData = orderDoc.data();

        const orderItem = document.createElement('div');
        orderItem.innerHTML = `
            <img src="${orderData.image}" alt="${orderData.name}" />
            <p>${orderData.name}</p>
            <p>Status: ${orderData.status}</p>
        `;
        ordersList.appendChild(orderItem);
    }
}

async function loadCart(userId) {
    const cartRef = doc(db, 'users', userId);
    const cartDoc = await getDoc(cartRef);
    const productIds = cartDoc.data().cart.split(',');

    for (const productId of productIds) {
        const productRef = doc(db, 'ProductDetails', productId);
        const productDoc = await getDoc(productRef);
        const productData = productDoc.data();

        const cartItem = document.createElement('div');
        cartItem.innerHTML = `
            <img src="${productData.image}" alt="${productData.name}" />
            <p>${productData.name}</p>
            <p>Price: ${productData.price}</p>
        `;
        cartList.appendChild(cartItem);
    }
}
