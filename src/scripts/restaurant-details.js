import { openDB } from "idb";
import "../styles/main.css";

document.addEventListener("DOMContentLoaded", async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const restaurantId = urlParams.get("id");

  if (restaurantId) {
    await loadRestaurantDetails(restaurantId);
    setupFavoriteButton(restaurantId);
  } else {
    showError("Invalid restaurant ID");
  }
});

async function loadRestaurantDetails(id) {
  try {
    const response = await fetch(
      `https://restaurant-api.dicoding.dev/detail/${id}`
    );
    if (!response.ok) throw new Error("Failed to fetch restaurant details");

    const { restaurant } = await response.json();
    displayRestaurantDetails(restaurant);
  } catch (error) {
    console.error("Error:", error);
    showError("Failed to load restaurant details. Please try again later.");
  }
}

function displayRestaurantDetails({
  name,
  pictureId,
  address,
  city,
  description,
  menus,
  customerReviews,
}) {
  const detailsContainer = document.getElementById("restaurant-details");
  detailsContainer.innerHTML = `
  <div class="restaurant-details">
    <h2 class="restaurant-name">${name}</h2>
    <img class="restaurant-image" src="https://restaurant-api.dicoding.dev/images/large/${pictureId}" alt="${name}" />
    
    <div class="restaurant-info">
      <p><strong>Address:</strong> ${address}</p>
      <p><strong>City:</strong> ${city}</p>
      <p><strong>Description:</strong> ${description}</p>
    </div>
    
    <div class="restaurant-menu">
      <h3>Food Menu</h3>
      <ul class="food-menu">${menus.foods
        .map((food) => `<li>${food.name}</li>`)
        .join("")}</ul>
      
      <h3>Drink Menu</h3>
      <ul class="drink-menu">${menus.drinks
        .map((drink) => `<li>${drink.name}</li>`)
        .join("")}</ul>
    </div>
    
    <div class="customer-reviews">
      <h3>Customer Reviews</h3>
      <ul class="reviews-list">
        ${customerReviews
          .map(
            (review) =>
              `<li><strong>${review.name}</strong>: ${review.review}</li>`
          )
          .join("")}
      </ul>
    </div>
  </div>
`;
}

async function setupFavoriteButton(restaurantId) {
  try {
    const db = await openDB("restau-run-db", 1, {
      upgrade(db) {
        // Ensure the store exists and uses 'id' as the key
        if (!db.objectStoreNames.contains("favorites")) {
          db.createObjectStore("favorites", { keyPath: "id" });
        }
      },
    });

    const favoriteButton = document.getElementById("favorite-button");

    let isFavorite = await db.get("favorites", restaurantId);

    favoriteButton.textContent = isFavorite
      ? "Remove from Favorites"
      : "Add to Favorites";

    favoriteButton.addEventListener("click", async () => {
      if (isFavorite) {
        try {
          await db.delete("favorites", restaurantId);
          isFavorite = null;
          favoriteButton.textContent = "Add to Favorites";
        } catch (error) {
          console.error("Error removing restaurant from favorites:", error);
        }
      } else {
        try {
          const response = await fetch(
            `https://restaurant-api.dicoding.dev/detail/${restaurantId}`
          );
          const { restaurant } = await response.json();

          if (restaurant) {
            const restaurantData = {
              id: restaurant.id,
              name: restaurant.name,
              pictureId: restaurant.pictureId,
              city: restaurant.city,
              rating: restaurant.rating,
            };

            const existingRestaurant = await db.get("favorites", restaurant.id);
            if (!existingRestaurant) {
              await db.put("favorites", restaurantData);
              isFavorite = restaurantData;
              favoriteButton.textContent = "Remove from Favorites";
            } else {
              console.log("Restaurant already in favorites.");
            }
          }
        } catch (error) {
          console.error("Error adding restaurant to favorites:", error);
        }
      }
    });
  } catch (error) {
    console.error("Error setting up favorite button:", error);
  }
}

function showError(message) {
  const detailsContainer = document.getElementById("restaurant-details");
  detailsContainer.innerHTML = `<p class="error">${message}</p>`;
}
