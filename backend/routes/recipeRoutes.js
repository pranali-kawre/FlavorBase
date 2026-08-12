const express = require('express');
const router = express.Router();
const recipeController = require('../controllers/recipeController');
const authMiddleware = require('../middleware/authMiddleware');

// Public routes — no login required
router.get('/', recipeController.getAll);
router.get('/:id', recipeController.getOne);

// Protected routes — must be logged in
router.post('/', authMiddleware, recipeController.create);
router.put('/:id', authMiddleware, recipeController.update);
router.delete('/:id', authMiddleware, recipeController.remove);

module.exports = router;