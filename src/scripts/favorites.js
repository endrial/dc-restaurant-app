import { openDB } from "idb";
import "../styles/main.css";

document.addEventListener("DOMContentLoaded", async () => {
  await loadFavoriteRestaurants();
});

async function loadFavoriteRestaurants() {
  const db = await openDB("restau-run-db", 1);
  const favoritesContainer = document.getElementById("favorites-container");

  if (favoritesContainer.children.length > 0) {
    return;
  }

  favoritesContainer.innerHTML = "";
  const favoriteRestaurants = await db.getAll("favorites");

  if (favoriteRestaurants.length === 0) {
    favoritesContainer.innerHTML = `<p>No favorite restaurants added yet.</p>`;
    return;
  }

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
      <a href="restaurant-details.html?id=${id}" class="detail-link">View Details</a>
    </div>
  `;
  return restaurantItem;
}
