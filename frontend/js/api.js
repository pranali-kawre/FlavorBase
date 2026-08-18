const API_BASE_URL = 'http://localhost:5000/api';

// Get the saved JWT token, if any
function getToken() {
  return localStorage.getItem('token');
}

// Save the JWT token after login/register
function setToken(token) {
  localStorage.setItem('token', token);
}

// Remove the token (logout)
function clearToken() {
  localStorage.removeItem('token');
}

// A generic wrapper around fetch() for all our API calls
async function apiRequest(endpoint, method = 'GET', body = null, requiresAuth = false) {
  const headers = { 'Content-Type': 'application/json' };

  if (requiresAuth) {
    const token = getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const options = { method, headers };
  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Something went wrong');
  }

  return data;
}

// ---------- Auth ----------
function registerUser(username, email, password) {
  return apiRequest('/auth/register', 'POST', { username, email, password });
}

function loginUser(email, password) {
  return apiRequest('/auth/login', 'POST', { email, password });
}

// ---------- Recipes ----------
function getRecipes() {
  return apiRequest('/recipes', 'GET');
}

function getRecipeById(id) {
  return apiRequest(`/recipes/${id}`, 'GET');
}

function createRecipe(recipeData) {
  return apiRequest('/recipes', 'POST', recipeData, true);
}

function updateRecipe(id, recipeData) {
  return apiRequest(`/recipes/${id}`, 'PUT', recipeData, true);
}

function deleteRecipe(id) {
  return apiRequest(`/recipes/${id}`, 'DELETE', null, true);
}

// ---------- Favorites ----------
function getFavorites() {
  return apiRequest('/favorites', 'GET', null, true);
}

function addFavorite(recipeId) {
  return apiRequest(`/favorites/${recipeId}`, 'POST', null, true);
}

function removeFavorite(recipeId) {
  return apiRequest(`/favorites/${recipeId}`, 'DELETE', null, true);
}