const db = require('../config/db');

// Create a new recipe
async function createRecipe(userId, title, description, ingredients, steps, imageUrl, category) {
    const [result] = await db.query(
        `INSERT INTO recipes (user_id, title, description, ingredients, steps, image_url, category)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [userId, title, description, ingredients, steps, imageUrl, category]
    );
    return result.insertId;
}

// Get all recipes
async function getAllRecipes() {
    const [rows] = await db.query(
        `SELECT recipes.*, users.username AS author 
     FROM recipes 
     JOIN users ON recipes.user_id = users.id 
     ORDER BY recipes.created_at DESC`
    );
    return rows;
}

// Get a single recipe by id
async function getRecipeById(id) {
    const [rows] = await db.query(
        `SELECT recipes.*, users.username AS author 
     FROM recipes 
     JOIN users ON recipes.user_id = users.id 
     WHERE recipes.id = ?`,
        [id]
    );
    return rows[0];
}

// Update a recipe
async function updateRecipe(id, title, description, ingredients, steps, imageUrl, category) {
    await db.query(
        `UPDATE recipes 
     SET title = ?, description = ?, ingredients = ?, steps = ?, image_url = ?, category = ?
     WHERE id = ?`,
        [title, description, ingredients, steps, imageUrl, category, id]
    );
}

// Delete a recipe
async function deleteRecipe(id) {
    await db.query('DELETE FROM recipes WHERE id = ?', [id]);
}

module.exports = {
    createRecipe,
    getAllRecipes,
    getRecipeById,
    updateRecipe,
    deleteRecipe
};