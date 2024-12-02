import { ref, get } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-database.js";
import { database } from './firebase-config.js';  // Assuming this file contains your Firebase config


const productsRef = ref(database, '/Products');
const productContainer = document.getElementById('productContainer');

// Fetch and display the last 8 products from Firebase Realtime Database
get(productsRef)
    .then((snapshot) => {
        productContainer.innerHTML = ''; // Clear previous content
        const products = snapshot.val();

        if (products) {
            // Get the keys (product IDs) and sort them in descending order to get the last 8 products
            const sortedProductIds = Object.keys(products).sort((a, b) => b.localeCompare(a)); // Sort in descending order
            const limitedProductIds = sortedProductIds.slice(0, 8); // Get the last 8 product IDs

            limitedProductIds.forEach((productId) => {
                const product = products[productId];

                // Create a product card
                const productCard = document.createElement('div');
                productCard.classList.add('product-card');

                // Add onClick event to redirect to the product details page
                productCard.addEventListener('click', () => {
                    window.location.href = `/GNET-Infotech/product-details?id=${productId}`;
                });

                // Check if the image URL exists and is valid
                const imageUrl = product.img || ''; // If no image, it will be an empty string
                const productImage = imageUrl ? `<img src="${imageUrl}" alt="${product.name}" class="product-image">` : '<div class="image-placeholder"></div>';

                // Set the innerHTML of the product card
                productCard.innerHTML = `
                    <div class="image-container">
                        ${productImage}
                    </div>
                    <h3>${product.name}</h3>
                    <h5>${product.price}</h5>
                `;

                // Append the card to the container
                productContainer.appendChild(productCard);
            });
        } else {
            productContainer.innerHTML = '<p>No products found.</p>';
        }
    })
    .catch((error) => {
        console.error("Error fetching products:", error);
    });
