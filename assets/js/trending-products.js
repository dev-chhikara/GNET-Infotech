import { database } from "./firebase-config.js"; // Firebase configuration
import { ref, get } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-database.js";

// Reference to the Firebase database where products are stored
const productsRef = ref(database, "/Products");

// Get the container where the products will be displayed
const productsContainer = document.querySelector(".trending-products-container");

// Fetch the products data from Firebase
get(productsRef).then(snapshot => {
  if (snapshot.exists()) {
    const productsData = snapshot.val(); // Get all product data

    // Loop through each product and create custom HTML layout for trending products
    Object.keys(productsData).forEach(productId => {
      const product = productsData[productId];

      // Filter products with the "trending" tag
      if (product.tag === "trending") {
        const productName = product.name; // Get product name
        const productImage = product.img; // Get product image URL
        const productDescription = product.description; // Get product description
        const productBrand = product.brand; // Get product brand name
        const productPrice = product.price; // Get product price

        // Create product item container
        const productItem = document.createElement("div");
        productItem.classList.add("product-item");

        // Product image with hover effect
        const imageContainer = document.createElement("div");
        imageContainer.classList.add("product-image");
        const img = document.createElement("img");
        img.src = productImage;
        img.alt = productName;
        imageContainer.appendChild(img);

        // Product name below the image
        const nameContainer = document.createElement("div");
        nameContainer.classList.add("product-name");
        nameContainer.textContent = productName;

        // Product description
        const descriptionContainer = document.createElement("div");
        descriptionContainer.classList.add("product-description");
        descriptionContainer.textContent = productDescription;

        // Brand and price container
        const infoContainer = document.createElement("div");
        infoContainer.classList.add("product-info");

        const brand = document.createElement("span");
        brand.classList.add("product-brand");
        brand.textContent = productBrand;

        const price = document.createElement("span");
        price.classList.add("product-price");
        price.textContent = `$${productPrice}`;

        infoContainer.appendChild(brand);
        infoContainer.appendChild(price);

        // Buy Now Button
        const buyNowButton = document.createElement("button");
        buyNowButton.classList.add("buy-now-btn");
        buyNowButton.textContent = "Buy Now";
        buyNowButton.onclick = () => {
          window.location.href = `/product-details?id=${productId}`;
        };

        // Append all elements to the product item container
        productItem.appendChild(imageContainer);
        productItem.appendChild(nameContainer); // Add product name below image
        productItem.appendChild(descriptionContainer);
        productItem.appendChild(infoContainer);
        productItem.appendChild(buyNowButton);

        // Append the product item to the products container
        productsContainer.appendChild(productItem);
      }
    });
  } else {
    console.log("No products found in the database.");
  }
}).catch(error => {
  console.error("Error fetching data from Firebase:", error);
});
