// Toggle Sort Menu with dark background
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

// Sort Items (For demonstration, logging to console)
function sortBy(option) {
    console.log("Sorting by:", option);
    // Close the sort menu after sorting
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

// Close Filter Menu when Apply Filters is clicked
function applyFilters() {
    const filterMenu = document.getElementById('filter-menu');
    filterMenu.style.display = 'none'; // Close the filter menu
    document.body.classList.remove('dark-background'); // Remove dark background
}
