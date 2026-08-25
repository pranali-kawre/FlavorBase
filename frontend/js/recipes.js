// ---------- Render recipe cards into a container ----------
function renderRecipeCards(recipes, containerEl, favoritedIds = new Set()) {
  if (recipes.length === 0) {
    containerEl.innerHTML = '<p class="loading-text">No recipes found.</p>';
    return;
  }

  const isLoggedIn = !!getToken();

  containerEl.innerHTML = recipes.map(recipe => {
    const isFav = favoritedIds.has(recipe.id);
    return `
    <div class="recipe-card" >
    <a class="recipe-card-link" href="recipe-details.html?id=${recipe.id}">
      <img
        class="recipe-card-image"
        src="${recipe.image_url || 'https://placehold.co/400x300?text=No+Image'}"
        alt="${recipe.title}"
      >
      <div class="recipe-card-body">
        <span class="recipe-card-category">${recipe.category || 'Uncategorized'}</span>
        <h3 class="recipe-card-title">${recipe.title}</h3>
        <p class="recipe-card-desc">${recipe.description || ''}</p>
        <span class="recipe-card-meta">By ${recipe.author}</span>
      </div>
      </a>
      <button
      class="recipe-card-fav ${isFav ? 'active' : ''}"
      data-recipe-id="${recipe.id}"
      style="${isLoggedIn ? '' : 'display: none;'}"
      title="${isFav ? 'Remove from favorites' : 'Add to favorites'}"
      >${isFav ? '❤️' : '🤍'}</button>
    </div>
    `;
  }).join('');
}

// ---------- Load and display all recipes on the homepage ----------
const recipeGrid = document.getElementById('recipe-grid');

if (recipeGrid) {
  (async () => {
    try {
      const recipes = await getRecipes();
      const favoritedIds = await getFavoritedRecipeIds();
      renderRecipeCards(recipes, recipeGrid, favoritedIds);
    } catch (err) {
      recipeGrid.innerHTML = `<p class="loading-text">Failed to load recipes: ${err.message}</p>`;
    }
  })();
}

// ---------- Handle search and category filtering ----------
const searchInput = document.getElementById('search-input');
const categoryFilter = document.getElementById('category-filter');

if (searchInput && categoryFilter) {
  let allRecipes = [];
  let favoritedIds = new Set();

  // Store all recipes once fetched, so filtering doesn't need new API calls
  (async () => {
    try {
      allRecipes = await getRecipes();
      favoritedIds = await getFavoritedRecipeIds();
    } catch (err) {
      console.error('Failed to load recipes for filtering:', err);
    }
  })();

  function applyFilters() {
    const searchTerm = searchInput.value.toLowerCase();
    const category = categoryFilter.value;

    const filtered = allRecipes.filter(recipe => {
      const matchesSearch = recipe.title.toLowerCase().includes(searchTerm);
      const matchesCategory = !category || recipe.category === category;
      return matchesSearch && matchesCategory;
    });

    renderRecipeCards(filtered, recipeGrid, favoritedIds);
  }

  searchInput.addEventListener('input', applyFilters);
  categoryFilter.addEventListener('change', applyFilters);
}

// ---------- Handle Add/Edit Recipe Form ----------
const addRecipeForm = document.getElementById('add-recipe-form');

if (addRecipeForm) {
  const urlParams = new URLSearchParams(window.location.search);
  const editId = urlParams.get('editId');

  // If editId is present, we're editing — pre-fill the form with existing data
  if (editId) {
    const formTitle = document.getElementById('form-title');
    const submitBtn = document.getElementById('submit-btn');

    formTitle.textContent = 'Edit Recipe';
    submitBtn.textContent = 'Save Changes';

    (async () => {
      try {
        const recipe = await getRecipeById(editId);

        document.getElementById('title').value = recipe.title;
        document.getElementById('description').value = recipe.description || '';
        document.getElementById('ingredients').value = recipe.ingredients;
        document.getElementById('steps').value = recipe.steps;
        document.getElementById('imageUrl').value = recipe.image_url || '';
        document.getElementById('category').value = recipe.category || 'Breakfast';
      } catch (err) {
        document.getElementById('recipe-error').textContent =
          'Failed to load recipe for editing: ' + err.message;
      }
    })();
  }

  addRecipeForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const errorEl = document.getElementById('recipe-error');
    errorEl.textContent = '';

    if (!getToken()) {
      errorEl.textContent = 'You must be logged in to add a recipe.';
      return;
    }

    const recipeData = {
      title: document.getElementById('title').value,
      description: document.getElementById('description').value,
      ingredients: document.getElementById('ingredients').value,
      steps: document.getElementById('steps').value,
      imageUrl: document.getElementById('imageUrl').value,
      category: document.getElementById('category').value
    };

    try {
      if (editId) {
        await updateRecipe(editId, recipeData);
        window.location.href = `recipe-details.html?id=${editId}`;
      } else {
        const result = await createRecipe(recipeData);
        window.location.href = `recipe-details.html?id=${result.recipeId}`;
      }
    } catch (err) {
      errorEl.textContent = err.message;
    }
  });
}

// ---------- Show full recipe details ----------
const recipeDetailContainer = document.getElementById('recipe-detail-container');

if (recipeDetailContainer) {
  const urlParams = new URLSearchParams(window.location.search);
  const recipeId = urlParams.get('id');

  (async () => {
    try {
      const recipe = await getRecipeById(recipeId);
      renderRecipeDetail(recipe);
    } catch (err) {
      recipeDetailContainer.innerHTML = `<p class="loading-text">Failed to load recipe: ${err.message}</p>`;
    }
  })();
}

function renderRecipeDetail(recipe) {
  recipeDetailContainer.innerHTML = `
    <img
      class="recipe-card-image"
      style="height: 280px; border-radius: 6px; margin-bottom: 1.25rem;"
      src="${recipe.image_url || 'https://placehold.co/600x400?text=No+Image'}"
      alt="${recipe.title}"
    >
    <span class="recipe-card-category">${recipe.category || 'Uncategorized'}</span>
    <h1 style="font-family: var(--font-display); font-size: 1.8rem; margin: 0.6rem 0;">
      ${recipe.title}
    </h1>
    <p class="recipe-card-meta" style="margin-bottom: 1rem;">By ${recipe.author}</p>
    <p style="margin-bottom: 1.5rem;">${recipe.description || ''}</p>

    <h3 style="font-family: var(--font-display); margin-bottom: 0.5rem;">Ingredients</h3>
    <p style="white-space: pre-line; margin-bottom: 1.5rem;">${recipe.ingredients}</p>

    <h3 style="font-family: var(--font-display); margin-bottom: 0.5rem;">Steps</h3>
    <p style="white-space: pre-line;">${recipe.steps}</p>
  `;

  // Show Edit/Delete buttons only if the logged-in user owns this recipe
  showOwnerActionsIfApplicable(recipe);
}

function showOwnerActionsIfApplicable(recipe) {
  const ownerActions = document.getElementById('owner-actions');
  if (!ownerActions) return;

  const token = getToken();
  if (!token) return; // not logged in at all

  // Decode the JWT payload to get the logged-in user's id
  const payload = JSON.parse(atob(token.split('.')[1]));
  const loggedInUserId = payload.userId;

  if (recipe.user_id === loggedInUserId) {
    ownerActions.style.display = 'flex';

    document.getElementById('delete-recipe-btn').addEventListener('click', async () => {
      if (!confirm('Are you sure you want to delete this recipe?')) return;

      try {
        await deleteRecipe(recipe.id);
        window.location.href = 'index.html';
      } catch (err) {
        alert('Failed to delete recipe: ' + err.message);
      }
    });

    document.getElementById('edit-recipe-btn').addEventListener('click', () => {
      window.location.href = `add-recipe.html?editId=${recipe.id}`;
    });
  }
}