function toggleSortMenu() {
    const menu = document.getElementById('sort-menu');
    const body = document.body;

    // Toggle the dark background
    body.classList.toggle('dark-background');

    // Toggle the sort menu visibility
    if (menu.style.display === 'block') {
        menu.style.display = 'none';
        body.classList.remove('dark-background');
    } else {
        menu.style.display = 'block';
    }
}

function applySort(sortValue) {
    const url = new URL(window.location.href); // Get current URL
    url.searchParams.set("sort", sortValue);  // Set the ?sort= parameter
    window.location.href = url.toString();   // Reload the page with updated URL
}



// Sort Items (For demonstration, logging to console)
function sortBy(option) {
    applySort(option);
    document.getElementById('sort-menu').style.display = 'none';
    document.body.classList.remove('dark-background');
}

// Toggle Filter Menu
function toggleFilterMenu() {
    const menu = document.getElementById('filter-menu');
    const body = document.body;

    // Toggle the dark background
    body.classList.toggle('dark-background');

    // Toggle the filter menu visibility
    if (menu.style.display === 'block') {
        menu.style.display = 'none';
        body.classList.remove('dark-background');
    } else {
        menu.style.display = 'block';
    }
}

// Close the menu if clicked outside
window.addEventListener('click', function (e) {
    const sortMenu = document.getElementById('sort-menu');
    const filterMenu = document.getElementById('filter-menu');
    const sortButton = document.querySelector('.sort-btn');
    const filterButton = document.querySelector('.filter-btn');

    if (!sortMenu.contains(e.target) && !sortButton.contains(e.target)) {
        sortMenu.style.display = 'none';
        document.body.classList.remove('dark-background');
    }

    if (!filterMenu.contains(e.target) && !filterButton.contains(e.target)) {
        filterMenu.style.display = 'none';
        document.body.classList.remove('dark-background');
    }
});
function applyFilters() {
    const url = new URL(window.location.href); // Get the current URL

    // Initialize filter arrays and variables
    const selectedBrands = [];
    const selectedCategories = [];
    let selectedPriceRange = null;

    // Collect selected brands
    document.querySelectorAll('input[type="checkbox"][id^="brand-"]:checked').forEach((checkbox) => {
        selectedBrands.push(checkbox.id.replace("brand-", ""));
    });

    // Collect selected categories
    document.querySelectorAll('input[type="checkbox"][id^="purpose-"]:checked').forEach((checkbox) => {
        selectedCategories.push(checkbox.id.replace("purpose-", ""));
    });

    // Collect selected price range
    const priceRangeRadio = document.querySelector('input[type="radio"][name="price-range"]:checked');
    if (priceRangeRadio) {
        selectedPriceRange = priceRangeRadio.id.replace("price-", "");
    }

    // Clear previous filter tags from the URL before adding new ones
    url.searchParams.delete("brand");
    url.searchParams.delete("category");
    url.searchParams.delete("price_range");

    // Update the URL search parameters with new values
    updateUrlParams(url, "brand", selectedBrands);
    updateUrlParams(url, "category", selectedCategories);
    updateUrlParams(url, "price_range", selectedPriceRange ? [selectedPriceRange] : []);

    // Update the browser's URL without reloading the page
    window.history.pushState({}, '', url.toString());

    // Close the filter menu
    const filterMenu = document.getElementById('filter-menu');
    if (filterMenu) {
        filterMenu.style.display = 'none'; // Hide the filter menu
    }

    document.body.classList.remove('dark-background'); // Remove dark background

    location.reload();
}

/**
 * Update URL search parameters for a specific key.
 * Removes the parameter if no values are provided or updates it if the value is different.
 * 
 * @param {URL} url - The current URL object.
 * @param {string} key - The key to update in the URL.
 * @param {Array} values - Array of values for the key.
 */
function updateUrlParams(url, key, values) {
    if (values.length > 0) {
        // Update or add the parameter
        url.searchParams.set(key, values.join(","));
    } else {
        url.searchParams.delete(key); // Remove the parameter if no values
    }
}





