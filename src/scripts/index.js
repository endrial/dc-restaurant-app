import "regenerator-runtime";
import "../styles/main.css";

let deferredPrompt;

window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;

  const installButton = document.getElementById("install-button");
  installButton.style.display = "block"; // Show the install button

  installButton.addEventListener("click", () => {
    deferredPrompt.prompt(); // Show the install prompt

    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === "accepted") {
        console.log("User accepted the A2HS prompt");
      } else {
        console.log("User dismissed the A2HS prompt");
      }
      deferredPrompt = null;
    });
  });
});

document.addEventListener("DOMContentLoaded", () => {
  loadRestaurants();

  const hamburger = document.querySelector(".hamburger");
  const navMenu = document.querySelector(".nav-menu");

  hamburger.addEventListener("click", () => toggleMenu(hamburger, navMenu));

  hamburger.addEventListener("keypress", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      toggleMenu(hamburger, navMenu);
    }
  });

  document.addEventListener("click", (event) =>
    closeMenuOnClick(event, navMenu, hamburger)
  );
});

async function loadRestaurants() {
  try {
    console.log("Fetching restaurant data from API...");
    const response = await fetch("https://restaurant-api.dicoding.dev/list");
    if (!response.ok) throw new Error("Failed to fetch data from the API");

    const data = await response.json();
    displayRestaurants(data.restaurants);
  } catch (error) {
    console.error("Error:", error);
    showError("Failed to load restaurant data. Please try again later.");
  }
}

function displayRestaurants(restaurants) {
  const restaurantsContainer = document.getElementById("restaurants-container");
  restaurantsContainer.innerHTML = "";

  restaurants.forEach((restaurant) => {
    restaurantsContainer.appendChild(createRestaurantElement(restaurant));
  });
}
function createRestaurantElement({
  pictureId,
  name,
  city,
  rating,
  description,
  id,
}) {
  return createElement(`
    <div class="restaurant-item" tabindex="0">
      <img src="https://restaurant-api.dicoding.dev/images/medium/${pictureId}" alt="${name}" class="restaurant-image"/>
      <div class="restaurant-content">
        <h3>${name}</h3>
        <p>${city} - ${generateStarRating(rating)}</p>
        <p>${description}</p>
        <a href="restaurant-details.html?id=${id}" class="detail-link">View Details</a>
      </div>
    </div>
  `);
}

function generateStarRating(rating) {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.5;
  const totalStars = 5;

  const stars = Array.from({ length: totalStars }, (_, index) => {
    if (index < fullStars) return '<i class="fas fa-star"></i>';
    if (index === fullStars && halfStar)
      return '<i class="fas fa-star-half-alt"></i>';
    return '<i class="far fa-star"></i>';
  }).join("");

  return `<span class="rating-tooltip" aria-label="${rating} stars">${stars}</span>`;
}

function showError(message) {
  const restaurantsContainer = document.getElementById("restaurants-container");
  restaurantsContainer.innerHTML = `<p class="error">${message}</p>`;
}

function toggleMenu(hamburger, navMenu) {
  navMenu.classList.toggle("active");
  const expanded = hamburger.getAttribute("aria-expanded") === "true";
  hamburger.setAttribute("aria-expanded", !expanded);
}

function closeMenuOnClick(event, navMenu, hamburger) {
  if (!navMenu.contains(event.target) && !hamburger.contains(event.target)) {
    navMenu.classList.remove("active");
    hamburger.setAttribute("aria-expanded", "false");
  }
}

function createElement(html) {
  const template = document.createElement("template");
  template.innerHTML = html.trim();
  return template.content.firstChild;
}

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        console.log(
          "Service Worker registered with scope:",
          registration.scope
        );
      })
      .catch((error) => {
        console.error("Service Worker registration failed:", error);
      });
  });
}
