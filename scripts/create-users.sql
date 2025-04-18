-- Script to create default admin and superadmin users

-- Check if users table exists, create if not
CREATE TABLE IF NOT EXISTS public.users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'user',
  full_name VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(255)
);

-- Insert admin user if not exists
INSERT INTO public.users (username, password, role, full_name, email, phone)
SELECT 'admin', 
       '6a12e6179119bfb9b6fb6742bd9a3840b5b0a3ce1b3794787df96905475f2adca3a9eb44573bcd35aa8088f72e52c3ec62a74d721d5383ece588712a499af95c.7de728943829a0b714eb821b8e80cc0f', 
       'admin', 
       'Admin User', 
       'admin@orbitinstitute.com', 
       '+971 123456789'
WHERE NOT EXISTS (SELECT 1 FROM public.users WHERE username = 'admin');

-- Insert superadmin user if not exists
INSERT INTO public.users (username, password, role, full_name, email, phone)
SELECT 'superadmin', 
       'c8130dfeeae120bb8a53f88258bfb842bec1f02528433c9201ef6da0342a137d5635f8217a87440065a4ef39035ef68342e9dbc64df288f9a6f2a1a4d4ced7f8.446e5d11dce9bb5a8dc999f68d0f47e8', 
       'superadmin', 
       'Super Admin', 
       'superadmin@orbitinstitute.com', 
       '+971 987654321'
WHERE NOT EXISTS (SELECT 1 FROM public.users WHERE username = 'superadmin');

-- Display users after creation
SELECT id, username, role, full_name FROM public.users;