const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { createUser, findUserByEmail } = require('../models/userModel');

// Register a new user
async function register(req, res) {
    try {
        const { username, email, password } = req.body;

        // Basic validation
        if (!username || !email || !password) {
            return res.status(400).json({ error: 'Username, email, and password are all required' });
        }

        // Check if the email is already registered
        const existingUser = await findUserByEmail(email);
        if (existingUser) {
            return res.status(409).json({ error: 'Email is already registered' });
        }

        // Hash the password before storing it — never store plain text passwords
        const passwordHash = await bcrypt.hash(password, 10);

        // Save the new user
        const userId = await createUser(username, email, passwordHash);

        res.status(201).json({ message: 'User registered successfully', userId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Something went wrong during registration' });
    }
}

// Log in an existing user
async function login(req, res) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Find the user
        const user = await findUserByEmail(email);
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Compare the submitted password against the stored hash
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Create a JWT token containing the user's id
        const token = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({ message: 'Login successful', token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Something went wrong during login' });
    }
}

module.exports = { register, login };