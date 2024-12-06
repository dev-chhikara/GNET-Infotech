import { auth, database } from "./firebase-config.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-database.js";
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
        productName.textContent = product.name || "Product Name";
        productDescription.textContent = product.description || "Product Description";
        document.getElementById("buying-section").style.display = "block";
        addressFormSection.style.display = "block";
    } else {
        alert("Product not found.");
    }
}

fetchProductDetails();

document.getElementById('place-order-btn').addEventListener('click', function (event) {
    event.preventDefault();

    const urlParams = new URLSearchParams(window.location.search);
    const productsId = urlParams.get("productid");

    const name = document.getElementById('name').value;
    const mobile = document.getElementById('mobile').value;
    const email = document.getElementById('email').value;
    const address = document.getElementById('address').value;
    const city = document.getElementById('city').value;
    const state = document.getElementById('state').value;
    const country = document.getElementById('country').value;
    const quantity = document.getElementById('quantity').value;

    if (!name || !mobile || !email || !address || !city || !state || !quantity) {
        alert('Please fill all fields');
        return;
    }

    const orderDetails = {
        name,
        mobile,
        email,
        address,
        city,
        state,
        country,
        quantity,
    };

    // Fetch Product ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get("productid");
    fetchProductDetails(productId);

    // Order Data for Firebase
    const orderData = {
        userAuthId: auth.currentUser.uid,  // User's Auth ID
        userMobile: mobile,                // User's Mobile
        productCode: productId,            // Product Code (ID)
        status: 'Pending',                 // Default status
        orderDetails: orderDetails,
        timestamp: Date.now(),             // Timestamp of the order
    };

    // Save Order to Firebase
    const orderRef = ref(db, 'Orders/' + Date.now());  // Use timestamp as unique key
    set(orderRef, orderData)
        .then(() => {
            console.log('Order placed and saved to Firebase!');
            
            // Send WhatsApp message after successful order placement
            const product = {
                name: "Sample Product",  // Replace with actual product name
                price: "₹500",           // Replace with actual product price
            };

            // WhatsApp Message Format
            const whatsappMessage = `
                *Order Placed!*\n
                Product: ${product.name}\n
                Price: ${product.price}\n
                Quantity: ${orderDetails.quantity}\n
                Delivery Address: ${orderDetails.address}, ${orderDetails.city}, ${orderDetails.state}, ${orderDetails.country}\n
                We will contact you soon for the payment.
            `;

            // WhatsApp Message Link (Replace with your WhatsApp business number)
            const whatsappUrl = `https://wa.me/919876543210?text=${encodeURIComponent(whatsappMessage)}`;
            window.open(whatsappUrl, '_blank');

            // Show "Order Placed" message
            document.getElementById("buying-section").innerHTML = "<h2 style='color: green;'>Order Placed!</h2>";

            // Redirect to Home page after 5 seconds
            setTimeout(() => {
                window.location.href = "/"; // Redirect to Home page
            }, 5000);
        })
        .catch((error) => {
            console.error("Error saving order to Firebase:", error);
        });
});

fetchProductDetails(productId);
