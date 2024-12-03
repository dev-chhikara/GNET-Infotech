import { database } from "./firebase-config.js";
import { ref, get } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-database.js";

// Reference to the Firebase database where brand logos are stored
const brandsRef = ref(database, "/Brands");

// Get the container where the brands will be added
const brandsScrollContainer = document.querySelector(".brands-scroll-container");

// Function to create brand elements and append them to the container
function createBrandElement(brandName, brandLogoUrl) {
    const brandItem = document.createElement("div");
    brandItem.classList.add("brand-item");

    const brandLogo = document.createElement("img");
    brandLogo.src = brandLogoUrl;
    brandLogo.alt = brandName;
    brandLogo.classList.add("brand-logo");

    // Add click event to navigate to the category page
    brandItem.addEventListener("click", () => {
        window.location.href = `/products?brand=${encodeURIComponent(brandName)}`;
    });

    brandItem.appendChild(brandLogo);
    brandsScrollContainer.appendChild(brandItem);
}

// Fetch brand data from Firebase
get(brandsRef).then(snapshot => {
    if (snapshot.exists()) {
        const brandsData = snapshot.val();

        // Loop through each brand and create HTML elements for logos
        Object.keys(brandsData).forEach(brandId => {
            const brandName = brandsData[brandId].name; // Get the brand name
            const brandLogoUrl = brandsData[brandId].img; // Get the brand logo URL

            createBrandElement(brandName, brandLogoUrl);
        });
    } else {
        console.log("No data available for brands");
        // Optionally, you could display a fallback message to users
        brandsScrollContainer.innerHTML = "<p>No brands available</p>";
    }
}).catch(error => {
    console.error("Error fetching brand data:", error);
    // Optionally, display a user-friendly error message
    brandsScrollContainer.innerHTML = "<p>Failed to load brands. Please try again later.</p>";
});
