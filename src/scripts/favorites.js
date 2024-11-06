import { openDB } from "idb";

document.addEventListener("DOMContentLoaded", async () => {
  await loadFavoriteRestaurants();
});

// async function loadFavoriteRestaurants() {
//   const db = await openDB("restau-run-db", 1);
//   const favoritesContainer = document.getElementById("favorites-container");
//   favoritesContainer.innerHTML = ""; // Clear existing content

//   const favoriteRestaurants = await db.getAll("favorites");

//   if (favoriteRestaurants.length === 0) {
//     favoritesContainer.innerHTML = `<p>No favorite restaurants added yet.</p>`;
//     return;
//   }

//   favoriteRestaurants.forEach((restaurant) => {
//     favoritesContainer.appendChild(createRestaurantElement(restaurant));
//   });
// }
async function loadFavoriteRestaurants() {
  const db = await openDB("restau-run-db", 1);
  const favoritesContainer = document.getElementById("favorites-container");

  // Check if the favorite restaurants have already been loaded
  if (favoritesContainer.children.length > 0) {
    return; // If already loaded, do nothing
  }

  // Clear existing content
  favoritesContainer.innerHTML = "";

  // Get all favorite restaurants from IndexedDB
  const favoriteRestaurants = await db.getAll("favorites");

  if (favoriteRestaurants.length === 0) {
    favoritesContainer.innerHTML = `<p>No favorite restaurants added yet.</p>`;
    return;
  }

  // Display each favorite restaurant
  favoriteRestaurants.forEach((restaurant) => {
    favoritesContainer.appendChild(createRestaurantElement(restaurant));
  });
}

function createRestaurantElement({ id, pictureId, name, city, rating }) {
  const restaurantItem = document.createElement("div");
  restaurantItem.className = "restaurant-item";
  restaurantItem.innerHTML = `
    <img src="https://restaurant-api.dicoding.dev/images/medium/${pictureId}" alt="${name}" class="restaurant-image" />
    <div class="restaurant-content">
      <h3>${name}</h3>
      <p>${city ? `City: ${city}` : `Rating: ${rating}`}</p>
      <a href="restaurant-details.html?id=${id}" class="cta-link">View Details</a>
    </div>
  `;
  return restaurantItem;
}
