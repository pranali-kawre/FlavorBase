// ---------- Favorite button on recipe detail page ----------
const favoriteBtn = document.getElementById('favorite-btn');

if (favoriteBtn) {
  const urlParams = new URLSearchParams(window.location.search);
  const recipeId = urlParams.get('id');

  (async () => {
    // Only show the button if logged in
    if (!getToken()) return;

    favoriteBtn.style.display = 'inline-block';

    // Check if this recipe is already in the user's favorites
    try {
      const favorites = await getFavorites();
      const isFav = favorites.some(fav => fav.id == recipeId);
      updateFavoriteButton(isFav);
    } catch (err) {
      console.error('Failed to check favorite status:', err);
    }
  })();

  favoriteBtn.addEventListener('click', async () => {
    const isCurrentlyFavorited = favoriteBtn.dataset.favorited === 'true';

    try {
      if (isCurrentlyFavorited) {
        await removeFavorite(recipeId);
        updateFavoriteButton(false);
      } else {
        await addFavorite(recipeId);
        updateFavoriteButton(true);
      }
    } catch (err) {
      alert('Something went wrong: ' + err.message);
    }
  });
}

function updateFavoriteButton(isFavorited) {
  favoriteBtn.dataset.favorited = isFavorited;
  favoriteBtn.textContent = isFavorited ? '♥ Remove from Favorites' : '♡ Add to Favorites';
}

// ---------- Load and display the user's favorites on favorites.html ----------
const favoritesGrid = document.getElementById('favorites-grid');

if (favoritesGrid) {
  (async () => {
    if (!getToken()) {
      favoritesGrid.innerHTML = '<p class="loading-text">Please log in to view your favorites.</p>';
      return;
    }

    try {
      const favorites = await getFavorites();
      const favoritedIds = new Set(favorites.map(fav => fav.id));
      renderRecipeCards(favorites, favoritesGrid, favoritedIds);
    } catch (err) {
      favoritesGrid.innerHTML = `<p class="loading-text">Failed to load favorites: ${err.message}</p>`;
    }
  })();
}

// ---------- Handle heart icon clicks on recipe cards (grid + favorites page) ----------
function setupFavoriteHeartListeners(containerEl) {
  if (!containerEl) return;

  containerEl.addEventListener('click', async (e) => {
    const heartBtn = e.target.closest('.recipe-card-fav');
    if (!heartBtn) return;

    e.preventDefault();
    e.stopPropagation();

    const clickedRecipeId = heartBtn.dataset.recipeId;
    const isCurrentlyFavorited = heartBtn.classList.contains('active');

    try {
      if (isCurrentlyFavorited) {
        await removeFavorite(clickedRecipeId);
        heartBtn.classList.remove('active');
        heartBtn.textContent = '♡';
      } else {
        await addFavorite(clickedRecipeId);
        heartBtn.classList.add('active');
        heartBtn.textContent = '♥';
      }

      if (containerEl.id === 'favorites-grid' && isCurrentlyFavorited) {
        heartBtn.closest('.recipe-card').remove();
      }
    } catch (err) {
      alert('Something went wrong: ' + err.message);
    }
  });
}

setupFavoriteHeartListeners(document.getElementById('recipe-grid'));
setupFavoriteHeartListeners(document.getElementById('favorites-grid'));