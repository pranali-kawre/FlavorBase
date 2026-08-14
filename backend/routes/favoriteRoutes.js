const express = require('express');
const router = express.Router();
const favoriteController = require('../controllers/favoriteController');
const authMiddleware = require('../middleware/authMiddleware');

// All favorites routes require login
router.get('/', authMiddleware, favoriteController.getAll);
router.post('/:recipeId', authMiddleware, favoriteController.add);
router.delete('/:recipeId', authMiddleware, favoriteController.remove);

module.exports = router;