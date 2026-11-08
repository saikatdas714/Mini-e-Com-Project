-- ==========================================
-- Supabase Schema for Mini e-Commerce
-- Run this script in your Supabase SQL Editor
-- (Dashboard -> SQL Editor -> New query -> Run)
-- ==========================================

-- 1. Users Table
CREATE TABLE IF NOT EXISTS public.users (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'normal' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Products Table
CREATE TABLE IF NOT EXISTS public.products (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    description TEXT,
    image TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Cart Table
CREATE TABLE IF NOT EXISTS public.cart (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    product_id BIGINT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_user_product UNIQUE (user_id, product_id)
);

-- Disable Row Level Security (RLS) so the server service key has unrestricted access
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart DISABLE ROW LEVEL SECURITY;

-- Optional: Initial Seed Products
INSERT INTO public.products (name, price, description, image)
VALUES
('Wireless Noise-Canceling Headphones', 2999.00, 'Premium over-ear headphones with active noise cancellation and 30-hour battery life.', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80'),
('Smart Fitness Watch', 1899.00, 'All-in-one health tracker with AMOLED display, heart rate monitor, and sleep tracking.', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80'),
('Mechanical RGB Keyboard', 2499.00, 'Tenkeyless gaming mechanical keyboard with blue tactile switches and RGB backlighting.', 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop&q=80'),
('Ergonomic Wireless Mouse', 899.00, 'Comfortable ergonomic vertical design with silent clicks and high precision optical sensor.', 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600&auto=format&fit=crop&q=80'),
('Ultra HD 4K Action Camera', 4999.00, 'Waterproof action camera with electronic image stabilization and wide-angle lens.', 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop&q=80')
ON CONFLICT DO NOTHING;
