import { auth, database } from "./firebase-config.js";
import { getDatabase, ref, get, set } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-database.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/9.18.0/firebase-auth.js";

const urlParams = new URLSearchParams(window.location.search);
const productId = urlParams.get("productid");


export function checkLoginStatus() {
    const dialogBox = document.getElementById("dialog-box");
    onAuthStateChanged(auth, (user) => {
      if (user) {
        
      } else {
        window.location.href = `/login?checkout=${productId}`;
      }
    });
  }

  checkLoginStatus();

const db = database;

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

    const phoneRegex = /^[0-9]{10}$/;

    if (!name || !pincode || !phoneNumber || !email || !addressl1 || !city || !state) {
        alert('Please fill all fields');
        return;
    }
    
    if (!phoneRegex.test(phoneNumber)) {
        alert('Please enter a valid phone number');
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

    const date = Date.now();

    // Order Data for Firebase
    const orderData = {
        orderId: "#" + date,
        userAuthId: auth.currentUser.uid, 
        userMobile: phoneNumber,      
        userName: name,
        userEmail: email,
        productCode: productId,            
        status: 'Pending',                 
        address: orderDetails,
        timestamp: formatDate(date),            
    };

    // Save Order to Firebase
    const orderRef = ref(db, 'Orders/' + date);  // Use timestamp as unique key
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

function formatDate(timestamp) {
    const date = new Date(timestamp);

    // Get day, month, year, hours, and minutes
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'short' });  // Get month abbreviation
    const year = date.getFullYear();
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';

    // Convert 24-hour time to 12-hour format
    hours = hours % 12;
    hours = hours ? hours : 12; // Handle midnight (0) as 12
    const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;

    // Add the "st", "nd", "rd", or "th" suffix to the day
    let daySuffix = 'th';
    if (day === 1 || day === 21 || day === 31) {
        daySuffix = 'st';
    } else if (day === 2 || day === 22) {
        daySuffix = 'nd';
    } else if (day === 3 || day === 23) {
        daySuffix = 'rd';
    }

    // Format and return the date
    return `${hours}:${formattedMinutes} ${ampm} ${day}${daySuffix} ${month} ${year}`;
}

