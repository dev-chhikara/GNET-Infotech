import { ref, get } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-database.js";
import { database } from './firebase-config.js';  

const productsRef = ref(database, '/Products');
const productContainer = document.getElementById('productContainer');

get(productsRef)
    .then((snapshot) => {
        productContainer.innerHTML = ''; 
        const products = snapshot.val();

        if (products) {
            const sortedProductIds = Object.keys(products).sort((a, b) => b.localeCompare(a)); 

            const limitedProductIds = sortedProductIds.filter((productId) => {
                const product = products[productId];
                return !(product.price && product.price.toLowerCase().includes("soon"));
            }).slice(0, 8); 

            limitedProductIds.forEach((productId) => {
                const product = products[productId];

                const productCard = document.createElement('div');
                productCard.classList.add('product-card', 'glass-card');

                productCard.addEventListener('click', () => {
                    window.location.href = `/product-details.html?id=${productId}`;
                });

                const imageUrl = product.img || ''; 
                const productImage = imageUrl
                    ? `<img src="${imageUrl}" alt="${product.name}" class="product-image">`
                    : '<div class="image-placeholder"></div>';

                const price = product.price || 'Price not available';
                const mrp = product.mrp || '₹null/-';

                productCard.innerHTML = `
                <div class="image-container">
                    ${productImage}
                </div>
                <div id="product-text-container">
                    <div class="rate-container">
                        <h5 class="price">${price}</h5>
                        <p class="mrp"><s>${mrp}</s></p>
                    </div>
                    <h3>${product.name}</h3>
                    <p class="description">${product.description}</p>
                    <button class="modern-btn-outline" style="width:100%; margin-top:15px; padding: 10px; font-size: 0.9rem;">View Details</button>
                </div>
            `;
                productContainer.appendChild(productCard);
            });

            if (limitedProductIds.length === 0) {
                productContainer.innerHTML = '<p style="grid-column: 1 / -1; text-align: center;">No products found without "soon" in the price.</p>';
            }
        } else {
            productContainer.innerHTML = '<p style="grid-column: 1 / -1; text-align: center;">No products found.</p>';
        }
    })
    .catch((error) => {
        console.error("Error fetching products:", error);
    });