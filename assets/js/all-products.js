import { ref, get } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-database.js";
import { database } from './firebase-config.js'; // Assuming this file contains your Firebase config

// Get the sort key, brand filters, and category filters from the URL query parameters
const urlParams = new URLSearchParams(window.location.search);
const sortKey = urlParams.get("sort"); // Sorting key, e.g., ?sort=price-asc
const brandFilters = urlParams.get("brand") ? urlParams.get("brand").split(",") : []; // Brand filter, e.g., ?brand=Dell,HP
const categoryFilters = urlParams.get("category") ? urlParams.get("category").split(",") : []; // Category filter, e.g., ?category=business,student

const productsRef = ref(database, '/Products');
const productContainer = document.getElementById('productContainer');

// Utility function to extract numeric price from a string like "Rs 4,999/-"
function parsePrice(priceString) {
    if (!priceString || priceString.includes("null")) return 0; // Handle "Rs null/-"
    return parseInt(priceString.replace(/Rs\s|,|\/-/g, ''), 10) || 0;
}

// Fetch and display the products from Firebase Realtime Database
get(productsRef)
    .then((snapshot) => {
        productContainer.innerHTML = ''; // Clear previous content
        const products = snapshot.val();

        if (products) {

            // Get the product entries as an array for sorting and filtering
            let productEntries = Object.entries(products);

            // Filter out products with price equal to "soon"
            productEntries = productEntries.filter(([productId, product]) => {
                const validPrice = product.price !== "soon";
                if (!validPrice) console.log(`Filtered out due to invalid price: ${product.name} (${product.price})`);
                return validPrice;
            });

            // Filter based on selected brands (if any filters are applied)
            if (brandFilters.length > 0) {
                productEntries = productEntries.filter(([productId, product]) => {
                    const matchesBrand = brandFilters.includes(product.brand);
                    if (!matchesBrand) console.log(`Filtered out by brand: ${product.brand}`);
                    return matchesBrand;
                });
            }

            // Filter based on selected categories (if any filters are applied)
            if (categoryFilters.length > 0) {
                productEntries = productEntries.filter(([productId, product]) => {
                    const productCategories = product.category?.split(",") || [];
                    const matchesCategory = productCategories.some((cat) => categoryFilters.includes(cat));
                    if (!matchesCategory) console.log(`Filtered out by category: ${productCategories}`);
                    return matchesCategory;
                });
            }

            // Sort based on the `sortKey`
            switch (sortKey) {
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
                    // Assuming there's a `rating` field in the product object; fallback to leaving as-is
                    productEntries.sort(([, a], [, b]) => (b.rating || 0) - (a.rating || 0));
                    break;

                default:
                    console.log(`No valid sort key provided: ${sortKey}`);
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

                    // Set the innerHTML of the product card
                    productCard.innerHTML = `
                        <div class="image-container">
                            ${productImage}
                        </div>
                        <h3>${product.name}</h3>
                        <p class="description">${product.description}</p>
                        <h5 class="price">${price}</h5>
                    `;

                    // Append the card to the container
                    productContainer.appendChild(productCard);
                });
            } else {
                productContainer.innerHTML = '<p>No products match the selected filters.</p>';
            }
        } else {
            productContainer.innerHTML = '<p>No products found.</p>';
        }
    })
    .catch((error) => {
        console.error("Error fetching products:", error);
        productContainer.innerHTML = '<p>Error fetching products. Please try again later.</p>';
    });

