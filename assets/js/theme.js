import { database } from "./firebase-config.js";
import { ref, onValue, push } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-database.js";

const homeRef = ref(database, "/Theme/home");
const homeCatRef = ref(database, "/Theme/homeCategories");

const homescreenImageElement = document.querySelector("#lapImageHome");
const homescreenNameElement = document.querySelector("#lapNameHome");
const homescreenDetailsElement = document.querySelector("#lapDetailsHome");
const buyNowButton = document.querySelector("#lapButtonHome");
const homescreenPriceElement = document.querySelector("#lapPriceHome");

const catHomeButtonOne = document.querySelector("#catButtonOne");
const catHomeButtonTwo = document.querySelector("#catButtonTwo");
const catHomeButtonThree = document.querySelector("#catButtonThree");
const catHomeNameOne = document.querySelector("#catNameOne");
const catHomeImageOne = document.querySelector("#catImageOne");
const catHomeNameTwo = document.querySelector("#catNameTwo");
const catHomeImageTwo = document.querySelector("#catImageTwo");
const catHomeNameThree = document.querySelector("#catNameThree");
const catHomeImageThree = document.querySelector("#catImageThree");

onValue(homeRef, (snapshot1) => {
  const data = snapshot1.val();

  if (data) {
    homescreenImageElement.src = data.img || "";
    const productId = data.productId || "1";

    homescreenImageElement.onload = () => {
      const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            homescreenImageElement.classList.add('loaded');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.5 });

      observer.observe(homescreenImageElement);
    };

    homescreenNameElement.textContent = data.name || "";
    homescreenDetailsElement.textContent = data.details || "";
    homescreenPriceElement.textContent = "Only at Rs " + data.price || "Low Price";

    buyNowButton.addEventListener('click', () => {
      window.location.href = `/product-details?id=${productId}`;
    });

    const brandsContainer = document.querySelector(".brands-scroll-container");
    if (brandsContainer) {
      brandsContainer.classList.add("fade-in");
    }


  } else {
    console.error("No data found in the database!");
  }
});

onValue(homeCatRef, (snapshot) => {
  const dada = snapshot.val();

  if (dada) {
    catHomeImageOne.src = dada.imageOne || "";
    catHomeImageTwo.src = dada.imageTwo || "";
    catHomeImageThree.src = dada.imageThree || "";

    catHomeNameOne.textContent = dada.nameOne || "";
    catHomeNameTwo.textContent = dada.nameTwo || "";
    catHomeNameThree.textContent = dada.nameThree || "";

    const idOne = dada.idOne;
    const idTwo = dada.idTwo;
    const idThree = dada.idThree;


    catHomeButtonOne.addEventListener('click', () => {
      window.location.href = `/products?category=${idOne}`;
    });

    catHomeButtonTwo.addEventListener('click', () => {
      window.location.href = `/products?category=${idTwo}`;
    });

    catHomeButtonThree.addEventListener('click', () => {
      window.location.href = `/products?category=${idThree}`;
    });


  } else {
    console.error("No data found in the database!");
  }
});

document.getElementById("bulkOrderForm").addEventListener("submit", (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const messageElement = document.getElementById("message");
  const bulkOrderRef = ref(database, "/BulkOrders");
  const emailField = document.getElementById("email");
  const submitButton = document.getElementById("submitButton");

  const now = new Date();
  const options = { hour: '2-digit', minute: '2-digit', hour12: true };
  const time = now.toLocaleTimeString('en-US', options);
  
  const dateOptions = { day: 'numeric', month: 'long', year: 'numeric' };
  const date = now.toLocaleDateString('en-US', dateOptions);

  const sentTime = `${time}, ${date}`;

  push(bulkOrderRef, { email, sentTime })
    .then(() => {
      messageElement.textContent = "We will contact you soon!";
      messageElement.style.color = "#27ae60";
      document.getElementById("email").value = "";
      emailField.style.display = "none";
      submitButton.style.display = "none";
    })
    .catch((error) => {
      console.error("Error submitting form: ", error);
      messageElement.textContent = "An error occurred. Please try again.";
      messageElement.style.color = "#e74c3c";
    });
});