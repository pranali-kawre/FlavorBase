// ---------- Render recipe cards into a container ----------
function renderRecipeCards(recipes, containerEl) {
  if (recipes.length === 0) {
    containerEl.innerHTML = '<p class="loading-text">No recipes found.</p>';
    return;
  }

  containerEl.innerHTML = recipes.map(recipe => `
    <div class="recipe-card" onclick="window.location.href='recipe-details.html?id=${recipe.id}'">
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
    </div>
  `).join('');
}

// ---------- Load and display all recipes on the homepage ----------
const recipeGrid = document.getElementById('recipe-grid');

if (recipeGrid) {
  (async () => {
    try {
      const recipes = await getRecipes();
      renderRecipeCards(recipes, recipeGrid);
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

  // Store all recipes once fetched, so filtering doesn't need new API calls
  (async () => {
    try {
      allRecipes = await getRecipes();
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

    renderRecipeCards(filtered, recipeGrid);
  }

  searchInput.addEventListener('input', applyFilters);
  categoryFilter.addEventListener('change', applyFilters);
}

// ---------- Handle Add Recipe Form ----------
const addRecipeForm = document.getElementById('add-recipe-form');

if (addRecipeForm) {
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
      const result = await createRecipe(recipeData);
      // Redirect to the new recipe's detail page
      window.location.href = `recipe-details.html?id=${result.recipeId}`;
    } catch (err) {
      errorEl.textContent = err.message;
    }
  });
}