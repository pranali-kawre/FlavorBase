const {
    createRecipe,
    getAllRecipes,
    getRecipeById,
    updateRecipe,
    deleteRecipe
} = require('../models/recipeModel');

// Create a new recipe (requires login)
async function create(req, res) {
    try {
        const { title, description, ingredients, steps, imageUrl, category } = req.body;

        if (!title || !ingredients || !steps) {
            return res.status(400).json({ error: 'Title, ingredients, and steps are required' });
        }

        const recipeId = await createRecipe(
            req.userId, // comes from authMiddleware, not the request body
            title,
            description,
            ingredients,
            steps,
            imageUrl,
            category
        );

        res.status(201).json({ message: 'Recipe created successfully', recipeId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Something went wrong creating the recipe' });
    }
}

// Get all recipes (public, no login required)
async function getAll(req, res) {
    try {
        const recipes = await getAllRecipes();
        res.json(recipes);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Something went wrong fetching recipes' });
    }
}

// Get a single recipe by id (public)
async function getOne(req, res) {
    try {
        const recipe = await getRecipeById(req.params.id);

        if (!recipe) {
            return res.status(404).json({ error: 'Recipe not found' });
        }

        res.json(recipe);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Something went wrong fetching the recipe' });
    }
}

// Update a recipe (requires login AND ownership)
async function update(req, res) {
    try {
        const recipe = await getRecipeById(req.params.id);

        if (!recipe) {
            return res.status(404).json({ error: 'Recipe not found' });
        }

        if (recipe.user_id !== req.userId) {
            return res.status(403).json({ error: 'You can only edit your own recipes' });
        }

        const { title, description, ingredients, steps, imageUrl, category } = req.body;

        await updateRecipe(req.params.id, title, description, ingredients, steps, imageUrl, category);

        res.json({ message: 'Recipe updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Something went wrong updating the recipe' });
    }
}

// Delete a recipe (requires login AND ownership)
async function remove(req, res) {
    try {
        const recipe = await getRecipeById(req.params.id);

        if (!recipe) {
            return res.status(404).json({ error: 'Recipe not found' });
        }

        if (recipe.user_id !== req.userId) {
            return res.status(403).json({ error: 'You can only delete your own recipes' });
        }

        await deleteRecipe(req.params.id);

        res.json({ message: 'Recipe deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Something went wrong deleting the recipe' });
    }
}

module.exports = { create, getAll, getOne, update, remove };