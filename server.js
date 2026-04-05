const express = require('express');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('./')); // Serve static files from the current directory

// Neon connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Create users table if not exists
async function setupDatabase() {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(50) UNIQUE NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  try {
    await pool.query(createTableQuery);
    console.log('Database setup complete: users table is ready.');
  } catch (err) {
    console.error('Error setting up database:', err);
  }
}

setupDatabase();

// Signup endpoint
app.post('/api/signup', async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  // Constraint: Only @gmail.com is allowed
  if (!email.toLowerCase().endsWith('@gmail.com')) {
    return res.status(400).json({ error: 'Only Gmail accounts are allowed for signup.' });
  }

  try {
    // Constraint: Emails and usernames cannot be repeated (handled by DB UNIQUE constraint, but good for explicit check)
    const existingUser = await pool.query('SELECT * FROM users WHERE email = $1 OR username = $2', [email, username]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Username or Email already exists.' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    await pool.query(
      'INSERT INTO users (username, email, password) VALUES ($1, $2, $3)',
      [username, email, hashedPassword]
    );

    res.status(201).json({ message: 'User created successfully.' });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'An unexpected error occurred.' });
  }
});

// Login endpoint
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }

  try {
    const user = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    if (user.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid username or password.' });
    }

    const isValid = await bcrypt.compare(password, user.rows[0].password);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid username or password.' });
    }

    // Success (returning data for client logic)
    res.json({ 
      message: 'Login successful.',
      user: { id: user.rows[0].id, username: user.rows[0].username, email: user.rows[0].email }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'An unexpected error occurred.' });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

module.exports = app;
