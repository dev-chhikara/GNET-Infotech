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

// Handle form submission
document.getElementById('address-form').addEventListener('submit', function (e) {
    e.preventDefault();

    const name = document.getElementById('name').value;
    const phone = document.getElementById('phone').value;
    const address = document.getElementById('address').value;
    const city = document.getElementById('city').value;
    const pincode = document.getElementById('pincode').value;
    const quantity = document.getElementById('quantity').value;

    // Fetch the product details using the productId from the URL
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('productid');

    // Assuming you already have Firebase Realtime Database set up to fetch the product
    const productRef = ref(db, `products/${productId}`);
    
    get(productRef)
        .then((snapshot) => {
            if (snapshot.exists()) {
                const product = snapshot.val();
                
                // Display order status
                document.getElementById('order-status').style.display = 'block';
                setTimeout(() => {
                    window.location.href = '/'; // Redirect to the home page after 5 seconds
                }, 5000);

                // Send the WhatsApp Business message
                const whatsappMessage = `Order Placed!\n\nProduct: ${product.name}\nPrice: ₹${product.price}\nQuantity: ${quantity}\nDelivery Address: ${address}, ${city}, ${pincode}, India\nWe will contact you soon for the payment.`;
                const encodedMessage = encodeURIComponent(whatsappMessage);

                // Replace with your WhatsApp Business number
                const whatsappURL = `https://wa.me/your-whatsapp-business-number?text=${encodedMessage}`;
                
                // Open the WhatsApp URL
                window.open(whatsappURL, '_blank');
            } else {
                alert("Product not found.");
            }
        })
        .catch((error) => {
            console.error("Error fetching product:", error);
            alert("Error fetching product details. Please try again.");
        });
});
