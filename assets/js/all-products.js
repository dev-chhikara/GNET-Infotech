import { ref, get } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-database.js";
import { database } from './firebase-config.js'; // Assuming this file contains your Firebase config

const productsRef = ref(database, '/Products');
const productContainer = document.getElementById('productContainer');
const searchInput = document.querySelector('.search-input');

// Utility function to extract numeric price from a string like "Rs 4,999/-"
function parsePrice(priceString) {
    if (!priceString || priceString.includes("null")) return 0; // Handle "Rs null/-"
    return parseInt(priceString.replace(/Rs\s|,|\/-/g, ''), 10) || 0;
}

// Utility function to update the product list based on filters and search
function updateProductList(products, filters) {
    productContainer.innerHTML = ''; // Clear previous content

    // Get the product entries as an array for sorting and filtering
    let productEntries = Object.entries(products);

    // Filter out products with price equal to "soon"
    productEntries = productEntries.filter(([productId, product]) => {
        const validPrice = product.price !== "soon";
        if (!validPrice) console.log(`New Products: ${product.name} (${product.price})`);
        return validPrice;
    });

    // Filter based on selected brand filters (if any filters are applied)
    if (filters.brandFilters.length > 0) {
        productEntries = productEntries.filter(([productId, product]) => {
            const matchesBrand = filters.brandFilters.includes(product.brand);
            if (!matchesBrand) console.log(`Filtered out by brand: ${product.brand}`);
            return matchesBrand;
        });
    }

    // Filter based on selected category filters (if any filters are applied)
    if (filters.categoryFilters.length > 0) {
        productEntries = productEntries.filter(([productId, product]) => {
            const productCategories = product.category?.split(",") || [];
            const matchesCategory = productCategories.some((cat) => filters.categoryFilters.includes(cat));
            if (!matchesCategory) console.log(`Filtered out by category: ${productCategories}`);
            return matchesCategory;
        });
    }

    // Filter based on the search query
    if (filters.searchQuery) {
        productEntries = productEntries.filter(([productId, product]) => {
            return product.name.toLowerCase().includes(filters.searchQuery.toLowerCase());
        });
    }

    // Sort the products based on the selected sort key
    switch (filters.sortKey) {
        case "price-asc":
            productEntries.sort(([, a], [, b]) => parsePrice(a.price) - parsePrice(b.price));
            break;
        case "price-desc":
            productEntries.sort(([, a], [, b]) => parsePrice(b.price) - parsePrice(a.price));
            break;
        case "newest":
            productEntries.sort(([a], [b]) => b.localeCompare(a)); // Sort by document ID (keys) in descending order
            break;
        case "rating":
            productEntries.sort(([, a], [, b]) => (b.rating || 0) - (a.rating || 0));
            break;
        default:
            console.log(`No valid sort key provided: ${filters.sortKey}`);
            break; // No sorting if no valid sort key is provided
    }

    // Display the sorted and filtered products
    if (productEntries.length > 0) {
        productEntries.forEach(([productId, product]) => {
            // Create a product card
            const productCard = document.createElement('div');
            productCard.classList.add('product-card');

            // Add onClick event to redirect to the product details page
            productCard.addEventListener('click', () => {
                window.location.href = `/product-details?id=${productId}`;
            });

            // Check if the image URL exists and is valid
            const imageUrl = product.img || ''; // If no image, it will be an empty string
            const productImage = imageUrl ? `<img src="${imageUrl}" alt="${product.name}" class="product-image">` : '<div class="image-placeholder"></div>';

            // Ensure the price is correctly displayed
            const price = product.price || 'Price not available'; // Fallback to default text if price is not available

            const mrp = product.mrp || '₹null/-';

                // Set the innerHTML of the product card
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
                <button id="buy-now" class="buy-now">View Details</button>
                </div>
            `;

            // Append the card to the container
            productContainer.appendChild(productCard);
        });
    } else {
        productContainer.innerHTML = '<p>No products match the selected filters.</p>';
    }
}

// Get the sort key, brand filters, and category filters from the URL query parameters
const urlParams = new URLSearchParams(window.location.search);
const sortKey = urlParams.get("sort"); // Sorting key, e.g., ?sort=price-asc
const brandFilters = urlParams.get("brand") ? urlParams.get("brand").split(",") : []; // Brand filter, e.g., ?brand=Dell,HP
const categoryFilters = urlParams.get("category") ? urlParams.get("category").split(",") : []; // Category filter, e.g., ?category=business,student

const filters = {
    sortKey,
    brandFilters,
    categoryFilters,
    searchQuery: '', // Initial search query is empty
};

// Fetch and display the products from Firebase Realtime Database
get(productsRef)
    .then((snapshot) => {
        const products = snapshot.val();

        if (products) {
            updateProductList(products, filters);
        } else {
            productContainer.innerHTML = '<p>No products found.</p>';
        }
    })
    .catch((error) => {
        console.error("Error fetching products:", error);
        productContainer.innerHTML = '<p>Error fetching products. Please try again later.</p>';
    });

// Event listener for search input to filter products as the user types
searchInput.addEventListener('input', (event) => {
    filters.searchQuery = event.target.value; // Update the search query
    get(productsRef)
        .then((snapshot) => {
            const products = snapshot.val();
            if (products) {
                updateProductList(products, filters);
            } else {
                productContainer.innerHTML = '<p>No products found.</p>';
            }
        })
        .catch((error) => {
            console.error("Error fetching products:", error);
            productContainer.innerHTML = '<p>Error fetching products. Please try again later.</p>';
        });
});
