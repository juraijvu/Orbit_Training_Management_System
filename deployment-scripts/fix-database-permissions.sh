#!/bin/bash

echo "Fixing PostgreSQL database permissions..."

# Check if .env file exists and get database credentials
if [ -f ".env" ]; then
    # Extract database URL components
    DB_URL=$(grep DATABASE_URL .env | cut -d'=' -f2)
    echo "Found DATABASE_URL in .env"
else
    echo "Creating .env file with default settings..."
    cat > .env << EOF
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://orbit_user:OrbitSecure2024!@localhost:5432/orbit_db
SESSION_SECRET=your_super_secure_session_secret_change_this_to_something_random_and_long
EOF
fi

# Fix PostgreSQL permissions
echo "Setting up PostgreSQL permissions..."

sudo -i -u postgres psql << EOF
-- Drop and recreate user with proper permissions
DROP USER IF EXISTS orbit_user;
CREATE USER orbit_user WITH ENCRYPTED PASSWORD 'OrbitSecure2024!';

-- Grant all privileges on database
GRANT ALL PRIVILEGES ON DATABASE orbit_db TO orbit_user;

-- Make orbit_user the owner of the database
ALTER DATABASE orbit_db OWNER TO orbit_user;

-- Grant permissions on public schema
GRANT ALL ON SCHEMA public TO orbit_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO orbit_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO orbit_user;

-- Set default privileges for future objects
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO orbit_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO orbit_user;

\q
EOF

echo "Database permissions fixed!"
echo ""
echo "Database credentials:"
echo "Host: localhost"
echo "Database: orbit_db"
echo "Username: orbit_user"
echo "Password: OrbitSecure2024!"
echo ""
echo "Now try running: npm run db:push"