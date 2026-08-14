const db = require('../config/db');

// Add a recipe to a user's favorites
async function addFavorite(userId, recipeId) {
  const [result] = await db.query(
    'INSERT INTO favorites (user_id, recipe_id) VALUES (?, ?)',
    [userId, recipeId]
  );
  return result.insertId;
}

// Remove a recipe from a user's favorites
async function removeFavorite(userId, recipeId) {
  await db.query(
    'DELETE FROM favorites WHERE user_id = ? AND recipe_id = ?',
    [userId, recipeId]
  );
}

// Get all favorites for a user, joined with recipe details
async function getFavoritesByUser(userId) {
  const [rows] = await db.query(
    `SELECT recipes.*, users.username AS author
     FROM favorites
     JOIN recipes ON favorites.recipe_id = recipes.id
     JOIN users ON recipes.user_id = users.id
     WHERE favorites.user_id = ?
     ORDER BY favorites.created_at DESC`,
    [userId]
  );
  return rows;
}

// Check if a specific recipe is already favorited by a user
async function isFavorited(userId, recipeId) {
  const [rows] = await db.query(
    'SELECT * FROM favorites WHERE user_id = ? AND recipe_id = ?',
    [userId, recipeId]
  );
  return rows.length > 0;
}

module.exports = {
  addFavorite,
  removeFavorite,
  getFavoritesByUser,
  isFavorited
};