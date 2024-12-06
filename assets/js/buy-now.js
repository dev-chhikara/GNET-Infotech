import { auth, database } from "./firebase-config.js";
import { getDatabase, ref, get, set } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-database.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/9.18.0/firebase-auth.js";


export function checkLoginStatus() {
    const dialogBox = document.getElementById("dialog-box");
    onAuthStateChanged(auth, (user) => {
      if (user) {
        
      } else {
        window.location.href = `/login`;
        
      }
    });
  }

  checkLoginStatus();

const db = database;

const urlParams = new URLSearchParams(window.location.search);
const productId = urlParams.get("productid");

const productImage = document.getElementById("productImage");
const productName = document.getElementById("product-name");
const productDescription = document.getElementById("product-description");
const addressFormSection = document.getElementById("address-form-section");
const orderConfirmation = document.getElementById("order-confirmation");

// Fetch product details from the database
async function fetchProductDetails() {
    const productRef = ref(db, `Products/${productId}`);
    const snapshot = await get(productRef);
    if (snapshot.exists()) {
        const product = snapshot.val();
        productImage.src = product.img || "";
        productName.textContent = product.name || "";
        productDescription.textContent = product.description || "";
        document.getElementById("buying-section").style.display = "block";
        addressFormSection.style.display = "block";
    } else {
        window.location.href('/index.html')
        alert("Product not found.");
    }
}

fetchProductDetails();

document.getElementById('place-order-btn').addEventListener('click', function (event) {
    event.preventDefault();

    const urlParams = new URLSearchParams(window.location.search);

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const phoneNumber = document.getElementById('phoneNumber').value;
    const addressl1 = document.getElementById('addressL1').value;
    const addressl2 = document.getElementById('addressL2').value;
    const addressl3 = document.getElementById('addressL3').value;
    const city = document.getElementById('city').value;
    const pincode = document.getElementById('pincode').value;
    const state = document.getElementById('state').value;

    if (!name || !pincode || !phoneNumber || !email || !addressl1 || !city  || !state) {
        alert('Please fill all fields');
        return;
    }

    const orderDetails = {
        addressl1,
        addressl2,
        addressl3,
        pincode,
        city,
        state
    };

    const productId = urlParams.get("productid");
    fetchProductDetails(productId);

    // Order Data for Firebase
    const orderData = {
        userAuthId: auth.currentUser.uid, 
        userMobile: phoneNumber,      
        userName: name,
        userMobile: phoneNumber,   
        productCode: productId,            
        status: 'Pending',                 
        address: orderDetails,
        timestamp: Date.now(),            
    };

    // Save Order to Firebase
    const orderRef = ref(db, 'Orders/' + Date.now());  // Use timestamp as unique key
    set(orderRef, orderData)
        .then(() => {     

            alert("Order Placed! We will contact you soon!");

            // Show "Order Placed" message
            document.getElementById("buying-section").innerHTML = "<h2 style='color: green;'>Order Placed!</h2>";
            window.location.href = "/"; 
        })
        .catch((error) => {
            console.error("Error saving order to Firebase:", error);
        });
});

fetchProductDetails(productId);
