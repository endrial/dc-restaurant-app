import { openDB } from "idb";

document.addEventListener("DOMContentLoaded", async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const restaurantId = urlParams.get("id");

  if (restaurantId) {
    await loadRestaurantDetails(restaurantId);
    setupFavoriteButton(restaurantId); // Set up the favorite button here
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
    <h2>${name}</h2>
    <img src="https://restaurant-api.dicoding.dev/images/large/${pictureId}" alt="${name}" />
    <p><strong>Address:</strong> ${address}</p>
    <p><strong>City:</strong> ${city}</p>
    <p><strong>Description:</strong> ${description}</p>
    <h3>Food Menu</h3>
    <ul>${menus.foods.map((food) => `<li>${food.name}</li>`).join("")}</ul>
    <h3>Drink Menu</h3>
    <ul>${menus.drinks.map((drink) => `<li>${drink.name}</li>`).join("")}</ul>
    <h3>Customer Reviews</h3>
    <ul>${customerReviews
      .map(
        (review) => `<li><strong>${review.name}</strong>: ${review.review}</li>`
      )
      .join("")}</ul>
  `;
}

// async function setupFavoriteButton(restaurantId) {
//   const db = await openDB("restau-run-db", 1, {
//     upgrade(db) {
//       db.createObjectStore("favorites", { keyPath: "id" });
//     },
//   });

//   const favoriteButton = document.getElementById("favorite-button");
//   let isFavorite = await db.get("favorites", restaurantId);

//   favoriteButton.textContent = isFavorite
//     ? "Remove from Favorites"
//     : "Add to Favorites";
//   favoriteButton.addEventListener("click", async () => {
//     if (isFavorite) {
//       await db.delete("favorites", restaurantId);
//       favoriteButton.textContent = "Add to Favorites";
//       isFavorite = null;
//     } else {
//       const response = await fetch(
//         `https://restaurant-api.dicoding.dev/detail/${restaurantId}`
//       );
//       const { restaurant } = await response.json();

//       if (restaurant) {
//         const restaurantData = {
//           id: restaurantId,
//           name: restaurant.name,
//           pictureId: restaurant.pictureId,
//           city: restaurant.city,
//           rating: restaurant.rating,
//         };
//         await db.put("favorites", restaurantData);
//         favoriteButton.textContent = "Remove from Favorites";
//         isFavorite = restaurantData;
//       }
//     }
//   });
// }

// TODO: check why this double data when click add to favorite
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

    // Update button text based on whether the restaurant is already favorited
    favoriteButton.textContent = isFavorite
      ? "Remove from Favorites"
      : "Add to Favorites";

    // Set up the button's click event
    favoriteButton.addEventListener("click", async () => {
      if (isFavorite) {
        // Remove from favorites
        try {
          await db.delete("favorites", restaurantId);
          isFavorite = null; // Update isFavorite variable
          favoriteButton.textContent = "Add to Favorites";
        } catch (error) {
          console.error("Error removing restaurant from favorites:", error);
        }
      } else {
        // Fetch the restaurant data from the API
        try {
          const response = await fetch(
            `https://restaurant-api.dicoding.dev/detail/${restaurantId}`
          );
          const { restaurant } = await response.json();

          if (restaurant) {
            // Prepare the restaurant data for IndexedDB
            const restaurantData = {
              id: restaurant.id,
              name: restaurant.name,
              pictureId: restaurant.pictureId,
              city: restaurant.city,
              rating: restaurant.rating,
            };

            // Check if the restaurant already exists in favorites before adding it
            const existingRestaurant = await db.get("favorites", restaurant.id);
            if (!existingRestaurant) {
              // Add the restaurant to the favorites if not already there
              await db.put("favorites", restaurantData); // Using the restaurant's 'id' as the key
              isFavorite = restaurantData; // Update isFavorite variable
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
