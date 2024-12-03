document.addEventListener("DOMContentLoaded", () => {
  function adjustScrollAlignment() {
    const scrollContainer = document.querySelector(".brands-scroll-container");
    const scrollItems = document.querySelectorAll(".brand-item");

    if (!scrollContainer || !scrollItems.length) return;

    // Calculate total width of all items
    const totalItemsWidth = Array.from(scrollItems).reduce(
      (total, item) =>
        total + item.offsetWidth + parseInt(getComputedStyle(item).marginRight || 0),
      0
    );

    // If all items fit in the container, center them
    if (totalItemsWidth <= scrollContainer.offsetWidth) {
      scrollContainer.classList.add("center");
    } else {
      scrollContainer.classList.remove("center");
    }
  }


  // Call the function on load and resize
  adjustScrollAlignment();

  setTimeout(() => {

    adjustScrollAlignment();
  }, 1000);

  window.addEventListener("resize", adjustScrollAlignment);
});

document.getElementById('accountButton').addEventListener('click', function () {
  window.location.href = '/login';
});
