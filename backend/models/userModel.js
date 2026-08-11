const db = require('../config/db');

// Insert a new user into the database
async function createUser(username, email, passwordHash) {
    const [result] = await db.query(
        'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
        [username, email, passwordHash]
    );
    return result.insertId; // returns the new user's id
}

// Find a user by their email (used during login, and to check duplicates on register)
async function findUserByEmail(email) {
    const [rows] = await db.query(
        'SELECT * FROM users WHERE email = ?',
        [email]
    );
    return rows[0]; // undefined if no user found
}

module.exports = {
    createUser,
    findUserByEmail
};