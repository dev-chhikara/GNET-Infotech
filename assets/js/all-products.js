import { ref, get } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-database.js";
import { database } from './firebase-config.js'; 

const productsRef = ref(database, '/Products');
const productContainer = document.getElementById('productContainer');
const searchInput = document.querySelector('.search-input');

// UPGRADED: Strips absolutely everything except raw digits so sorting never breaks
function parsePrice(priceString) {
    if (!priceString || String(priceString).includes("null") || String(priceString).toLowerCase().includes("soon")) return 9999999; 
    return parseInt(String(priceString).replace(/[^0-9]/g, ''), 10) || 0;
}

function updateProductList(products, filters) {
    productContainer.innerHTML = ''; 

    let productEntries = Object.entries(products);

    productEntries = productEntries.filter(([productId, product]) => {
        return product.price !== "soon";
    });

    if (filters.brandFilters.length > 0) {
        productEntries = productEntries.filter(([productId, product]) => {
            return filters.brandFilters.includes(product.brand);
        });
    }

    if (filters.categoryFilters.length > 0) {
        productEntries = productEntries.filter(([productId, product]) => {
            const productCategories = product.category?.split(",") || [];
            return productCategories.some((cat) => filters.categoryFilters.includes(cat));
        });
    }

    if (filters.searchQuery) {
        productEntries = productEntries.filter(([productId, product]) => {
            return product.name.toLowerCase().includes(filters.searchQuery.toLowerCase());
        });
    }

    // Sort Logic
    switch (filters.sortKey) {
        case "price-asc":
            productEntries.sort(([, a], [, b]) => parsePrice(a.price) - parsePrice(b.price));
            break;
        case "price-desc":
            productEntries.sort(([, a], [, b]) => parsePrice(b.price) - parsePrice(a.price));
            break;
        case "newest":
            productEntries.sort(([a], [b]) => b.localeCompare(a));
            break;
        case "rating":
            productEntries.sort(([, a], [, b]) => (b.rating || 0) - (a.rating || 0));
            break;
    }

    if (productEntries.length > 0) {
        productEntries.forEach(([productId, product]) => {
            const productCard = document.createElement('div');
            productCard.classList.add('product-card', 'glass-card');

            productCard.addEventListener('click', () => {
                window.location.href = `/product-details.html?id=${productId}`;
            });

            const imageUrl = product.img || ''; 
            const productImage = imageUrl ? `<img src="${imageUrl}" alt="${product.name}" class="product-image">` : '<div class="image-placeholder"></div>';
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
    } else {
        productContainer.innerHTML = '<p style="grid-column: 1 / -1; text-align: center; font-size: 1.2rem;">No products match the selected filters.</p>';
    }
}

const urlParams = new URLSearchParams(window.location.search);
const sortKey = urlParams.get("sort");
const brandFilters = urlParams.get("brand") ? urlParams.get("brand").split(",") : []; 
const categoryFilters = urlParams.get("category") ? urlParams.get("category").split(",") : [];

const filters = {
    sortKey,
    brandFilters,
    categoryFilters,
    searchQuery: '',
};

get(productsRef).then((snapshot) => {
    const products = snapshot.val();
    if (products) {
        updateProductList(products, filters);
    } else {
        productContainer.innerHTML = '<p style="grid-column: 1 / -1; text-align: center;">No products found.</p>';
    }
}).catch((error) => {
    console.error("Error fetching products:", error);
});

searchInput.addEventListener('input', (event) => {
    filters.searchQuery = event.target.value; 
    get(productsRef).then((snapshot) => {
        const products = snapshot.val();
        if (products) {
            updateProductList(products, filters);
        }
    });
});