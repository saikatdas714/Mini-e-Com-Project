# Mini e-Com🛒 (Supabase Edition)

A server-rendered e-commerce web application built with **Node.js, Express, EJS, and Supabase Database**.

## Features

- User registration and login with bcrypt hashing & JWT cookies
- Supabase PostgreSQL database integration using `@supabase/supabase-js`
- Product catalog with deals & ratings
- User-specific shopping cart (add/remove items)
- Admin privileges: add products, create admin accounts
- Server-side rendering with EJS & Bootstrap 5 UI

## Tech Stack

- **Backend**: Node.js & Express.js
- **Database**: Supabase (PostgreSQL)
- **Client**: `@supabase/supabase-js`
- **Authentication**: JWT & HTTP-Only Cookies
- **View Engine**: EJS
- **Styling**: Bootstrap 5 & Bootstrap Icons

## Setup Instructions

### 1. Configure Supabase Database
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard).
2. Open your project, click **SQL Editor** on the left menu.
3. Paste the contents of `supabase_schema.sql` and click **Run**. This will create the `users`, `products`, and `cart` tables.

### 2. Configure Environment Variables
Open `.env` and set:
```env
PORT=3000
SUPABASE_URL=https://<your-project-ref>.supabase.co
SUPABASE_KEY=your_supabase_anon_or_service_key
JWT_SECRET=ecommerce_super_secret_jwt_key_2026
JWT_EXPIRES_IN=1h
```
*(Your Supabase URL can be copied from Supabase Dashboard -> **Project Settings** -> **API** -> **Project URL**)*

### 3. Test Connection
```bash
node test-connection.js
```

### 4. Start Application
```bash
npm start
```
Visit `http://localhost:3000/` in your browser.
