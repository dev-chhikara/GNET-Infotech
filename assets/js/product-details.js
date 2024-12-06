import { ref, get, push } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-database.js";
import { database } from './firebase-config.js';

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get("id");

    const productContainer = document.getElementById('productContainer');

    if (!productId) {
        productContainer.innerHTML = "<p>Invalid Product ID</p>";
        return;
    }

    const productRef = ref(database, `/Products/${productId}`);

    get(productRef)
    .then((snapshot) => {
        if (snapshot.exists()) {
            const product = snapshot.val();

            // Render product details
            productContainer.innerHTML = `
                <div class="image-section">
                    <img src="${product.img}" alt="${product.name}" class="main-image">
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
                    <p class="price">₹${product.price.replace("Rs ", "")}</p>
                    <div class="improvement-options">
                        ${renderImprovements(product.improvement || "", product.price.replace("Rs ", ""))}
                    </div>
                    <button id="buy-now" class="buy-now">Buy Now</button>
                </div>
            `;

            // Add click event for "Buy Now" button
            const buyNowButton = document.getElementById('buy-now');
            buyNowButton.addEventListener('click', function () {
                const productId = snapshot.key; // Use the product ID from Firebase snapshot
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
            productContainer.innerHTML = "<p>Product not found</p>";
        }
    })
    .catch(error => {
        console.error("Error fetching product details:", error);
        productContainer.innerHTML = "<p>Error fetching product details. Please try again later.</p>";
    });
});

/**
 * Renders the improvement options based on the "improvement" key in the database and updates the price dynamically.
 * @param {string} improvement - Comma-separated improvement options from the database.
 * @param {string} initialPrice - Initial base price of the product.
 * @returns {string} HTML string for the improvement options.
 */
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

    const ramSelect = document.getElementById('ram-select');
    const hddSelect = document.getElementById('hdd-select') || document.getElementById('ssd-select');
    const priceElement = document.querySelector('.price');

    if (!ramSelect || !hddSelect || !priceElement) {
        console.error("Error: One or more elements are missing");
        return optionsHTML || "<p>Upgradeable Configuration</p>";
    }

    // Initial price update when the page loads
    console.log("Updating initial price...");
    updatePrice(initialPrice, ramSelect, hddSelect, priceElement);

    // Set up event listeners
    ramSelect.addEventListener('change', () => updatePrice(initialPrice, ramSelect, hddSelect, priceElement));
    hddSelect.addEventListener('change', () => updatePrice(initialPrice, ramSelect, hddSelect, priceElement));

    return optionsHTML || "<p>No customizations available for this product.</p>";
}

/**
 * Updates the price based on the selected RAM and HDD values.
 * @param {number} initialPrice - The base price of the product.
 * @param {HTMLElement} ramSelect - The RAM select element.
 * @param {HTMLElement} hddSelect - The HDD/SSD select element.
 * @param {HTMLElement} priceElement - The price element to update.
 */
function updatePrice(initialPrice, ramSelect, hddSelect, priceElement) {
    let updatedPrice = parseInt(initialPrice);

    console.log("Initial Price:", initialPrice);
    console.log("Selected RAM:", ramSelect.value);
    console.log("Selected HDD/SSD:", hddSelect.value);

    const selectedRam = ramSelect.value;
    if (selectedRam === '16GB') {
        updatedPrice += 2000; // Increase by 2000 for 16GB RAM
    } else if (selectedRam === '32GB') {
        updatedPrice += 4000; 
    }

    // Check selected HDD
    const selectedHdd = hddSelect.value;
    if (selectedHdd === '512GB') {
        updatedPrice += 1000; // Increase by 1000 for 512GB HDD
    } else if (selectedHdd === '1TB') {
        updatedPrice += 3000; // Increase by 3000 for 1TB HDD
    }

    // Update the displayed price
    console.log("Updated Price:", updatedPrice);
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

  document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('buy-now').addEventListener('click', function () {
        const urlParams = new URLSearchParams(window.location.search);
        const productId = urlParams.get("id"); // Get "id" from the current URL
        window.location.href = `/buy-now?productid=${productId}`;
    });
});
