import { ref, get, push } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-database.js";
import { database } from './firebase-config.js';

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get("id");

    const productContainer = document.getElementById('productContainer');

    if (!productId) {
        productContainer.innerHTML = "<p style='text-align:center; padding:50px;'>Invalid Product ID</p>";
        return;
    }

    const productRef = ref(database, `/Products/${productId}`);

    get(productRef)
    .then((snapshot) => {
        if (snapshot.exists()) {
            const product = snapshot.val();

            // Render product details with proper wrapper
            productContainer.innerHTML = `
                <div class="product-details-wrapper glass-card-lg">
                    <div class="image-section">
                        <div class="main-image-wrapper">
                            <img src="${product.img}" alt="${product.name}" class="main-image">
                        </div>
                        <div class="thumbnails">
                            ${Object.values(product.images || {}).map(image => `
                                <img src="${image}" class="thumbnail" alt="Thumbnail">
                            `).join('')}
                        </div>
                    </div>
                    <div class="details-section">
                        <h1>${product.name}</h1>
                        <p class="description">${product.description}</p>
                        <p class="longdesc">${product.longdesc}</p>
                        
                        <p class="price">${product.price.replace("Rs ", "")}</p>
                        <p class="mrp">M.R.P. <s>${product.mrp.replace("Rs ", "")}</s></p>
                        
                        <div class="improvement-options">
                            ${renderImprovements(product.improvement || "", product.price.replace("Rs ", ""))}
                        </div>
                        
                        <button id="buy-now" class="hero-btn" style="width: 100%; max-width: 350px; margin-top: 20px;">Buy Now</button>
                    </div>
                </div>
            `;

            // Add click event for "Buy Now" button
            const buyNowButton = document.getElementById('buy-now');
            buyNowButton.addEventListener('click', function () {
                const productId = snapshot.key; 
                window.location.href = `/buy-now?productid=${productId}`;
            });

            // Add thumbnail click functionality
            const thumbnails = document.querySelectorAll('.thumbnail');
            const mainImage = document.querySelector('.main-image');

            thumbnails.forEach(thumbnail => {
                thumbnail.addEventListener('click', () => {
                    mainImage.src = thumbnail.src;
                });
            });
        } else {
            productContainer.innerHTML = "<p style='text-align:center; padding:50px;'>Product not found</p>";
        }
    })
    .catch(error => {
        console.error("Error fetching product details:", error);
        productContainer.innerHTML = "<p style='text-align:center; padding:50px;'>Error fetching product details. Please try again later.</p>";
    });
});

function renderImprovements(improvement, initialPrice) {
    const improvementOptions = improvement.split(",").map(opt => opt.trim());
    let optionsHTML = "";
    let updatedPrice = parseInt(initialPrice);

    improvementOptions.forEach(option => {
        if (option === "ram") {
            optionsHTML += `
                <div class="option-group">
                    <label for="ram-select">RAM:</label>
                    <select id="ram-select" name="ram">
                        <option value="8GB">8GB</option>
                        <option value="16GB">16GB</option>
                        <option value="32GB">32GB</option>
                    </select>
                </div>
            `;
        } else if (option === "hdd" || option === "ssd") {
            optionsHTML += `
                <div class="option-group">
                    <label for="${option}-select">${option.toUpperCase()}:</label>
                    <select id="${option}-select" name="${option}">
                        <option value="256GB">256GB</option>
                        <option value="512GB">512GB</option>
                        <option value="1TB">1TB</option>
                    </select>
                </div>
            `;
        }
    });

    setTimeout(() => {
        const ramSelect = document.getElementById('ram-select');
        const hddSelect = document.getElementById('hdd-select') || document.getElementById('ssd-select');
        const priceElement = document.querySelector('.price');

        if (!ramSelect && !hddSelect) return;

        updatePrice(initialPrice, ramSelect, hddSelect, priceElement);

        if (ramSelect) ramSelect.addEventListener('change', () => updatePrice(initialPrice, ramSelect, hddSelect, priceElement));
        if (hddSelect) hddSelect.addEventListener('change', () => updatePrice(initialPrice, ramSelect, hddSelect, priceElement));
    }, 100);

    return optionsHTML || "<p style='font-size: 0.9rem; color: #64748b;'>No customizations available for this product.</p>";
}

function updatePrice(initialPrice, ramSelect, hddSelect, priceElement) {
    let updatedPrice = parseInt(initialPrice);

    if (ramSelect) {
        const selectedRam = ramSelect.value;
        if (selectedRam === '16GB') updatedPrice += 2000;
        else if (selectedRam === '32GB') updatedPrice += 4000;
    }

    if (hddSelect) {
        const selectedHdd = hddSelect.value;
        if (selectedHdd === '512GB') updatedPrice += 1000;
        else if (selectedHdd === '1TB') updatedPrice += 3000;
    }

    priceElement.textContent = '₹' + updatedPrice;
}

document.getElementById("bulkOrderForm").addEventListener("submit", (e) => {
    e.preventDefault();
  
    const email = document.getElementById("email").value;
    const messageElement = document.getElementById("message");
    const bulkOrderRef = ref(database, "/BulkOrders");
    const emailField = document.getElementById("email");
    const submitButton = document.getElementById("submitButton");
  
    const now = new Date();
    const options = { hour: '2-digit', minute: '2-digit', hour12: true };
    const time = now.toLocaleTimeString('en-US', options);
    const dateOptions = { day: 'numeric', month: 'long', year: 'numeric' };
    const date = now.toLocaleDateString('en-US', dateOptions);
    const sentTime = `${time}, ${date}`;
  
    push(bulkOrderRef, { email, sentTime })
      .then(() => {
        messageElement.textContent = "We will contact you soon!";
        messageElement.style.color = "#27ae60";
        document.getElementById("email").value = "";
        emailField.style.display = "none";
        submitButton.style.display = "none";
      })
      .catch((error) => {
        console.error("Error submitting form: ", error);
        messageElement.textContent = "An error occurred. Please try again.";
        messageElement.style.color = "#e74c3c";
      });
});

document.getElementById('accountButton').addEventListener('click', function () {
    window.location.href = '/login';
});