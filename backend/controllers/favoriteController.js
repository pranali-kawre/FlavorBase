const {
  addFavorite,
  removeFavorite,
  getFavoritesByUser,
  isFavorited
} = require('../models/favoriteModel');
const { getRecipeById } = require('../models/recipeModel');

// Add a recipe to favorites
async function add(req, res) {
  try {
    const recipeId = req.params.recipeId;

    // Check the recipe actually exists before favoriting it
    const recipe = await getRecipeById(recipeId);
    if (!recipe) {
      return res.status(404).json({ error: 'Recipe not found' });
    }

    // Check it's not already favorited
    const alreadyFavorited = await isFavorited(req.userId, recipeId);
    if (alreadyFavorited) {
      return res.status(409).json({ error: 'Recipe is already in your favorites' });
    }

    await addFavorite(req.userId, recipeId);

    res.status(201).json({ message: 'Recipe added to favorites' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong adding the favorite' });
  }
}

// Remove a recipe from favorites
async function remove(req, res) {
  try {
    const recipeId = req.params.recipeId;

    await removeFavorite(req.userId, recipeId);

    res.json({ message: 'Recipe removed from favorites' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong removing the favorite' });
  }
}

// Get the logged-in user's favorites
async function getAll(req, res) {
  try {
    const favorites = await getFavoritesByUser(req.userId);
    res.json(favorites);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong fetching favorites' });
  }
}

module.exports = { add, remove, getAll };