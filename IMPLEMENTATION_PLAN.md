# Implementation Plan - Functional Login and Signup with Neon DB

This plan outlines the steps to make the login and signup processes functional in the Helio project using a Node.js backend and the provided Neon PostgreSQL database.

## 1. Setup Backend
- Initialize a Node.js project (`npm init -y`).
- Install dependencies: `express`, `pg`, `bcryptjs`, `cors`, `dotenv`.
- Create a `server.js` file to handle API requests.
- Create a `.env` file to store the Neon connection string securely.

## 2. Database Schema
- Connect to the Neon database using the provided connection string.
- Create a `users` table with the following fields:
  - `id` (SERIAL PRIMARY KEY)
  - `username` (VARCHAR(50) UNIQUE NOT NULL)
  - `email` (VARCHAR(100) UNIQUE NOT NULL)
  - `password` (VARCHAR(255) NOT NULL)

## 3. Backend Implementation
- **Sign Up Logic (`/api/signup`):**
  - Validate that the email ends with `@gmail.com`.
  - Check if the email or username already exists in the database.
  - Hash the password using `bcryptjs` before storage.
  - Insert the new user into the database.
- **Login Logic (`/api/login`):**
  - Verify if the user exists.
  - Compare the provided password with the hashed password in the database.
  - On success, return a success message (or a token).

## 4. Frontend Integration
- Update `login.html` to:
  - Add `id` attributes to input fields and forms.
  - Implement JavaScript `fetch` calls to communicate with the backend.
  - Add error/success message handling.
  - Redirect users appropriately on successful authentication.

## 5. Security & Validation
- Enforce the `@gmail.com` rule on both frontend and backend.
- Ensure unique emails and usernames across the database.
- Password hashing for security.

## 6. Testing
- Test sign-up with non-gmail addresses (should fail).
- Test sign-up with existing email (should fail).
- Test successful sign-up and login.
